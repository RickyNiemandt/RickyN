import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { db, storage, callRegisterTender } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { randomUUID } from '../util/uuid.js';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatBytes(n) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_LABEL = {
  pending: 'Pending',
  parsing: 'Parsing…',
  parsed: 'Parsed',
  matched: 'Matched',
  error: 'Error',
};

export default function TendersPage() {
  const { claims } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const companyId = claims?.companyId;

  useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(db, `companies/${companyId}/tenders`),
      orderBy('uploadedAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTenders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [companyId]);

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
          <h1 className="tv-page-title">Tenders</h1>
          <p className="tv-page-sub">
            Upload a tender/RFP to automatically extract and match compliance
            requirements against your vault.
          </p>
        </div>
        <button
          className="tv-btn tv-btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Upload tender
        </button>
      </div>

      {tenders.length === 0 ? (
        <div className="tv-empty">
          <p className="tv-empty-title">No tenders yet</p>
          <p className="tv-empty-sub">
            Upload a tender document to begin the compliance check process.
          </p>
          <button
            className="tv-btn tv-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Upload tender
          </button>
        </div>
      ) : (
        <div className="tv-card tv-card-table">
          <table className="tv-table">
            <thead>
              <tr>
                <th>Tender name</th>
                <th>File</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tenders.map((t) => (
                <tr
                  key={t.id}
                  className="tv-table-row-clickable"
                  onClick={() => navigate(`/tenders/${t.id}`)}
                >
                  <td className="tv-td-type">{t.name}</td>
                  <td className="tv-td-file">
                    <span className="tv-filename">{t.fileName}</span>
                    <span className="tv-filesize">{formatBytes(t.fileSize)}</span>
                  </td>
                  <td>
                    <span className={`tv-chip tv-chip-status-${t.status || 'pending'}`}>
                      {STATUS_LABEL[t.status] || 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(t.uploadedAt)}</td>
                  <td className="tv-td-actions">
                    <button
                      className="tv-btn tv-btn-secondary tv-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tenders/${t.id}`);
                      }}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UploadTenderModal
          companyId={companyId}
          onClose={() => setShowModal(false)}
          onCreated={(id) => navigate(`/tenders/${id}`)}
        />
      )}
    </div>
  );
}

function UploadTenderModal({ companyId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter a tender name.'); return; }
    if (!file) { setError('Please select a file.'); return; }

    setUploading(true);
    try {
      const uuid = randomUUID();
      const path = `companies/${companyId}/tenders/${uuid}/${file.name}`;
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

      const { data } = await callRegisterTender({
        name: name.trim(),
        fileName: file.name,
        storagePath: path,
        fileSize: file.size,
      });

      onCreated(data.tenderId);
    } catch (err) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tv-modal-header">
          <h2 className="tv-modal-title">Upload tender</h2>
          <button className="tv-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="tv-alert tv-alert-error tv-modal-alert">{error}</div>}

        <form className="tv-form" onSubmit={handleUpload}>
          <div className="tv-form-group">
            <label className="tv-label">Tender / project name</label>
            <input
              className="tv-input"
              type="text"
              placeholder="e.g. City of Cape Town — IT Services RFP 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="tv-form-group">
            <label className="tv-label">Tender document (PDF preferred)</label>
            <input
              className="tv-input-file"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              required
            />
            <span className="tv-input-hint">
              PDF documents give the best parsing results.
            </span>
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
            <button type="submit" className="tv-btn tv-btn-primary" disabled={uploading}>
              {uploading ? `Uploading… ${progress}%` : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
