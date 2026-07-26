import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await signup(email, password);
      // New users have no companyId claim → send them to onboarding.
      navigate('/onboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tv-auth-page">
      <div className="tv-auth-card">
        <div className="tv-auth-logo">
          <span className="tv-brand">Tender Vault</span>
          <span className="tv-brand-by">by Charm Systems</span>
        </div>
        <h1 className="tv-auth-title">Create account</h1>

        {error && <div className="tv-alert tv-alert-error">{error}</div>}

        <form className="tv-form" onSubmit={handleSubmit}>
          <div className="tv-form-group">
            <label className="tv-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="tv-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="tv-form-group">
            <label className="tv-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="tv-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="tv-form-group">
            <label className="tv-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="tv-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            className="tv-btn tv-btn-primary tv-btn-full"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="tv-auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="tv-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    default:
      return 'Sign-up failed. Please try again.';
  }
}
