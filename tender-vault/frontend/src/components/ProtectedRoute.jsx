import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// requireCompany: if true, also requires a companyId claim (i.e. onboarded).
export default function ProtectedRoute({ children, requireCompany = true }) {
  const { user, claims, loading } = useAuth();

  if (loading) {
    return (
      <div className="tv-loading-screen">
        <div className="tv-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireCompany && !claims?.companyId) {
    return <Navigate to="/onboard" replace />;
  }

  return children;
}
