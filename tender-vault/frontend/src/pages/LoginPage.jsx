import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/vault');
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
        <h1 className="tv-auth-title">Sign in</h1>

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
            />
          </div>
          <button
            className="tv-btn tv-btn-primary tv-btn-full"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="tv-auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="tv-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}
