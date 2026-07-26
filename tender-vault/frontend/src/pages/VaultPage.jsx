import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, callRegisterVaultDoc, callDeleteVaultDoc } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { randomUUID } from '../util/uuid.js';

const DOC_TYPES = [
  'Tax Clearance Certificate',
  'B-BBEE Certificate',
  'CIPC Company Registration',
  'CSD Profile',
  'COIDA Letter of Good Standing',
  'SARS VAT Registration',
  'Bank Confirmation Letter',
  'Letter of Good Standing',
  'Pricing Schedule',
  'Method Statement',
  'Professional Indemnity Insurance',
  'Public Liability Insurance',
  'Other',
];

function statusOf(doc) {
  if (!doc.expiresAt) return 'active';
  const exp = doc.expiresAt.toDate ? doc.expiresAt.toDate() : new Date(doc.expiresAt);
  return exp < new Date() ? 'expired' : 'active';
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBytes(n) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VaultPage() {
  const { claims } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const companyId = claims?.companyId;

  useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(db, `companies/${companyId}/vault`),
      orderBy('uploadedAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [companyId]);

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document from the vault?')) return;
    try {
      await callDeleteVaultDoc({ docId });
    } catch (err) {
      alert(err?.message || 'Delete failed.');
    }
  };

  const isAdmin = claims?.role === 'admin';

  if (loading) {
    return (
      <div className="tv-page">
        <div className="tv-loading-screen"><div className="tv-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="tv-page">
      <div className="tv-page-header">
        <div>
          <h1 className="tv-page-title">Compliance Vault</h1>
          <p className="tv-page-sub">
            Upload and manage your company&apos;s compliance documents.
          </p>
        </div>
        <button
          className="tv-btn tv-btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Upload document
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="tv-empty">
          <p className="tv-empty-title">Your vault is empty</p>
          <p className="tv-empty-sub">
            Upload your first compliance document to get started.
          </p>
          <button
            className="tv-btn tv-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Upload document
          </button>
        </div>
      ) : (
        <div className="tv-card tv-card-table">
          <table className="tv-table">
            <thead>
              <tr>
                <th>Document type</th>
                <th>File</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Uploaded</th>
                <th>Ver.</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => {
                const st = statusOf(doc);
                return (
                  <tr key={doc.id}>
                    <td className="tv-td-type">{doc.type}</td>
                    <td className="tv-td-file">
                      <span className="tv-filename">{doc.fileName}</span>
                      <span className="tv-filesize">{formatBytes(doc.fileSize)}</span>
                    </td>
                    <td>
                      <span className={`tv-chip tv-chip-${st}`}>
                        {st === 'active' ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>{formatDate(doc.expiresAt)}</td>
                    <td>{formatDate(doc.uploadedAt)}</td>
                    <td className="tv-td-center">v{doc.version || 1}</td>
                    {isAdmin && (
                      <td className="tv-td-actions">
                        <button
                          className="tv-btn tv-btn-danger tv-btn-sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UploadModal
          companyId={companyId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function UploadModal({ companyId, onClose }) {
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [file, setFile] = useState(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const resolvedType = type === 'Other' ? customType.trim() : type;

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!resolvedType) {
      setError('Please specify a document type.');
      return;
    }
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setUploading(true);
    try {
      const uuid = randomUUID();
      const path = `companies/${companyId}/vault/${uuid}/${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file, { contentType: file.type });

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snap) =>
            setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve,
        );
      });

      await callRegisterVaultDoc({
        type: resolvedType,
        fileName: file.name,
        storagePath: path,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        expiresAt: expiresAt || null,
        notes,
      });

      onClose();
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tv-modal-header">
          <h2 className="tv-modal-title">Upload compliance document</h2>
          <button className="tv-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="tv-alert tv-alert-error tv-modal-alert">{error}</div>}

        <form className="tv-form" onSubmit={handleUpload}>
          <div className="tv-form-group">
            <label className="tv-label">Document type</label>
            <select
              className="tv-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select type…</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {type === 'Other' && (
            <div className="tv-form-group">
              <label className="tv-label">Custom type name</label>
              <input
                className="tv-input"
                type="text"
                placeholder="e.g. Environmental Impact Assessment"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                required
              />
            </div>
          )}

          <div className="tv-form-group">
            <label className="tv-label">File (PDF or image)</label>
            <input
              ref={fileRef}
              className="tv-input-file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              required
            />
          </div>

          <div className="tv-form-group">
            <label className="tv-label">Expiry date (optional)</label>
            <input
              className="tv-input"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <span className="tv-input-hint">
              Leave blank if this document does not expire.
            </span>
          </div>

          <div className="tv-form-group">
            <label className="tv-label">Notes (optional)</label>
            <textarea
              className="tv-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this document…"
            />
          </div>

          {uploading && (
            <div className="tv-progress-bar">
              <div className="tv-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="tv-modal-footer">
            <button
              type="button"
              className="tv-btn tv-btn-secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tv-btn tv-btn-primary"
              disabled={uploading}
            >
              {uploading ? `Uploading… ${progress}%` : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
