import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  db,
  callParseTender,
  callMatchRequirements,
  callConfirmRequirement,
  callIssueDownloadUrl,
} from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL = {
  pending: 'Pending',
  parsing: 'Parsing…',
  parsed: 'Parsed',
  matched: 'Matched',
  error: 'Error',
};

const MATCH_META = {
  found: { label: 'Found', cls: 'tv-chip-found' },
  expired: { label: 'Expired', cls: 'tv-chip-expired' },
  missing: { label: 'Missing', cls: 'tv-chip-missing' },
};

export default function TenderDetailPage() {
  const { id: tenderId } = useParams();
  const { claims } = useAuth();
  const navigate = useNavigate();

  const [tender, setTender] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loadingTender, setLoadingTender] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [downloadUrls, setDownloadUrls] = useState({});

  const companyId = claims?.companyId;

  useEffect(() => {
    if (!companyId) return;
    const unsub = onSnapshot(
      doc(db, `companies/${companyId}/tenders`, tenderId),
      (snap) => {
        if (!snap.exists()) { navigate('/tenders'); return; }
        setTender({ id: snap.id, ...snap.data() });
        setLoadingTender(false);
      },
    );
    return unsub;
  }, [companyId, tenderId, navigate]);

  useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(db, `companies/${companyId}/tenders/${tenderId}/requirements`),
      orderBy('documentType'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequirements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingReqs(false);
    });
    return unsub;
  }, [companyId, tenderId]);

  const handleParse = async () => {
    setError('');
    setBusy('parse');
    try {
      const { data } = await callParseTender({ tenderId });
      // No need to update state — onSnapshot handles it.
      void data;
    } catch (err) {
      setError(err?.message || 'Parsing failed.');
    } finally {
      setBusy('');
    }
  };

  const handleMatch = async () => {
    setError('');
    setBusy('match');
    try {
      await callMatchRequirements({ tenderId });
    } catch (err) {
      setError(err?.message || 'Matching failed.');
    } finally {
      setBusy('');
    }
  };

  const handleConfirm = async (req) => {
    setError('');
    let acknowledgedExpiry = false;
    if (req.matchStatus === 'expired') {
      acknowledgedExpiry = window.confirm(
        `"${req.documentType}" is expired. Confirm anyway and acknowledge the expiry?`,
      );
      if (!acknowledgedExpiry) return;
    }
    setBusy(`confirm-${req.id}`);
    try {
      await callConfirmRequirement({
        tenderId,
        requirementId: req.id,
        acknowledgedExpiry,
      });
    } catch (err) {
      setError(err?.message || 'Confirm failed.');
    } finally {
      setBusy('');
    }
  };

  const handleDownload = async (req) => {
    setError('');
    setBusy(`dl-${req.id}`);
    try {
      const { data } = await callIssueDownloadUrl({
        tenderId,
        requirementId: req.id,
      });
      setDownloadUrls((prev) => ({ ...prev, [req.id]: data.downloadUrl }));
      window.open(data.downloadUrl, '_blank', 'noopener');
    } catch (err) {
      setError(err?.message || 'Download failed.');
    } finally {
      setBusy('');
    }
  };

  if (loadingTender) {
    return (
      <div className="tv-page">
        <div className="tv-loading-screen"><div className="tv-spinner" /></div>
      </div>
    );
  }

  const stats = {
    found: requirements.filter((r) => r.matchStatus === 'found').length,
    expired: requirements.filter((r) => r.matchStatus === 'expired').length,
    missing: requirements.filter((r) => r.matchStatus === 'missing').length,
    confirmed: requirements.filter((r) => r.confirmedAt).length,
    total: requirements.length,
  };

  const canDownloadAll = stats.confirmed > 0 && stats.missing === 0;
  const isParsing = tender.status === 'parsing';
  const isMatching = busy === 'match';

  return (
    <div className="tv-page">
      {/* Back link */}
      <button className="tv-back-link" onClick={() => navigate('/tenders')}>
        ← Tenders
      </button>

      <div className="tv-page-header tv-page-header-wrap">
        <div>
          <h1 className="tv-page-title">{tender.name}</h1>
          <p className="tv-page-sub">
            {tender.fileName} &nbsp;·&nbsp;
            <span className={`tv-chip tv-chip-status-${tender.status || 'pending'}`}>
              {STATUS_LABEL[tender.status] || 'Pending'}
            </span>
          </p>
        </div>

        <div className="tv-action-row">
          {(tender.status === 'pending' || tender.status === 'error') && (
            <button
              className="tv-btn tv-btn-primary"
              onClick={handleParse}
              disabled={isParsing || busy === 'parse'}
            >
              {busy === 'parse' ? 'Parsing…' : 'Parse tender'}
            </button>
          )}
          {tender.status === 'parsed' && (
            <button
              className="tv-btn tv-btn-primary"
              onClick={handleMatch}
              disabled={!!busy}
            >
              {isMatching ? 'Matching…' : 'Match requirements'}
            </button>
          )}
          {tender.status === 'matched' && (
            <button
              className="tv-btn tv-btn-secondary"
              onClick={handleMatch}
              disabled={!!busy}
            >
              Re-match
            </button>
          )}
        </div>
      </div>

      {tender.status === 'error' && tender.errorMessage && (
        <div className="tv-alert tv-alert-error">
          Parse error: {tender.errorMessage}
        </div>
      )}

      {error && <div className="tv-alert tv-alert-error">{error}</div>}

      {isParsing && (
        <div className="tv-alert tv-alert-info">
          <div className="tv-spinner tv-spinner-sm" />
          Parsing tender with Claude — this may take up to two minutes…
        </div>
      )}

      {/* Summary stats when matched */}
      {tender.status === 'matched' && stats.total > 0 && (
        <div className="tv-stats-row">
          <div className="tv-stat tv-stat-found">
            <span className="tv-stat-n">{stats.found}</span>
            <span className="tv-stat-label">Found</span>
          </div>
          <div className="tv-stat tv-stat-expired">
            <span className="tv-stat-n">{stats.expired}</span>
            <span className="tv-stat-label">Expired</span>
          </div>
          <div className="tv-stat tv-stat-missing">
            <span className="tv-stat-n">{stats.missing}</span>
            <span className="tv-stat-label">Missing</span>
          </div>
          <div className="tv-stat">
            <span className="tv-stat-n">{stats.confirmed}/{stats.total}</span>
            <span className="tv-stat-label">Confirmed</span>
          </div>
        </div>
      )}

      {/* Requirements table */}
      {!loadingReqs && requirements.length > 0 && (
        <div className="tv-card tv-card-table">
          <table className="tv-table">
            <thead>
              <tr>
                <th>Document required</th>
                <th>Match</th>
                <th>Mandatory</th>
                <th>Confirmed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => {
                const meta = MATCH_META[req.matchStatus] || MATCH_META.missing;
                const isConfirmed = !!req.confirmedAt;
                const isBusy =
                  busy === `confirm-${req.id}` || busy === `dl-${req.id}`;

                return (
                  <tr key={req.id}>
                    <td>
                      <div className="tv-req-type">{req.documentType}</div>
                      {req.description && (
                        <div className="tv-req-desc">{req.description}</div>
                      )}
                      {req.matchStatus === 'expired' && !isConfirmed && (
                        <div className="tv-req-warning">
                          ⚠ Document has expired — confirmation requires acknowledgment.
                        </div>
                      )}
                      {req.acknowledgedExpiry && (
                        <div className="tv-req-warning-ack">
                          Expiry acknowledged
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`tv-chip ${meta.cls}`}>{meta.label}</span>
                    </td>
                    <td>
                      {req.mandatory ? (
                        <span className="tv-chip tv-chip-mandatory">Required</span>
                      ) : (
                        <span className="tv-chip tv-chip-optional">Optional</span>
                      )}
                    </td>
                    <td>
                      {isConfirmed ? (
                        <span className="tv-confirmed-mark" title={formatDate(req.confirmedAt)}>
                          ✓ Confirmed
                        </span>
                      ) : (
                        <span className="tv-unconfirmed-mark">—</span>
                      )}
                    </td>
                    <td className="tv-td-actions">
                      {!isConfirmed && req.matchStatus !== 'missing' && (
                        <button
                          className="tv-btn tv-btn-secondary tv-btn-sm"
                          disabled={isBusy}
                          onClick={() => handleConfirm(req)}
                        >
                          {isBusy ? '…' : 'Confirm'}
                        </button>
                      )}
                      {isConfirmed && req.vaultDocId && (
                        <button
                          className="tv-btn tv-btn-primary tv-btn-sm"
                          disabled={isBusy}
                          onClick={() => handleDownload(req)}
                        >
                          {isBusy ? '…' : '⬇ Download'}
                        </button>
                      )}
                      {req.matchStatus === 'missing' && (
                        <span className="tv-td-missing-hint">Upload to vault first</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loadingReqs && requirements.length === 0 && tender.status === 'parsed' && (
        <div className="tv-alert tv-alert-info">
          No requirements were extracted. Try running Parse again or check the file format.
        </div>
      )}

      {!loadingReqs && requirements.length === 0 && tender.status === 'pending' && (
        <div className="tv-empty">
          <p className="tv-empty-title">Ready to parse</p>
          <p className="tv-empty-sub">
            Click &ldquo;Parse tender&rdquo; to extract compliance requirements using AI.
          </p>
        </div>
      )}
    </div>
  );
}
