import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { callProvisionCompany } from '../firebase.js';

export default function OnboardPage() {
  const { refreshClaims } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await callProvisionCompany({ companyName: companyName.trim() });
      // The function set custom claims — force a token refresh so the
      // client picks them up immediately.
      await refreshClaims();
      navigate('/vault');
    } catch (err) {
      const msg = err?.details?.message || err?.message || 'Company setup failed.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tv-auth-page">
      <div className="tv-auth-card tv-auth-card-wide">
        <div className="tv-auth-logo">
          <span className="tv-brand">Tender Vault</span>
          <span className="tv-brand-by">by Charm Systems</span>
        </div>
        <h1 className="tv-auth-title">Set up your company</h1>
        <p className="tv-auth-subtitle">
          You&apos;ll be the admin of this workspace. You can invite colleagues
          from the vault settings once set up.
        </p>

        {error && <div className="tv-alert tv-alert-error">{error}</div>}

        <form className="tv-form" onSubmit={handleSubmit}>
          <div className="tv-form-group">
            <label className="tv-label" htmlFor="company">Company name</label>
            <input
              id="company"
              className="tv-input"
              type="text"
              placeholder="e.g. Acme Consulting (Pty) Ltd"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button
            className="tv-btn tv-btn-primary tv-btn-full"
            type="submit"
            disabled={busy || !companyName.trim()}
          >
            {busy ? 'Setting up…' : 'Create workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
