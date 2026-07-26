import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, claims, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="tv-topbar">
      <div className="tv-topbar-inner">
        <div className="tv-brand-block">
          <span className="tv-brand">Tender Vault</span>
          <span className="tv-brand-by">by Charm Systems</span>
        </div>

        {user && claims?.companyId && (
          <nav className="tv-nav">
            <NavLink
              to="/vault"
              className={({ isActive }) =>
                'tv-nav-link' + (isActive ? ' active' : '')
              }
            >
              Vault
            </NavLink>
            <NavLink
              to="/tenders"
              className={({ isActive }) =>
                'tv-nav-link' + (isActive ? ' active' : '')
              }
            >
              Tenders
            </NavLink>
          </nav>
        )}

        <div className="tv-topbar-right">
          {user && (
            <>
              <span className="tv-user-email">{user.email}</span>
              {claims?.role === 'admin' && (
                <span className="tv-role-badge">Admin</span>
              )}
              <button className="tv-btn tv-btn-ghost tv-btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
