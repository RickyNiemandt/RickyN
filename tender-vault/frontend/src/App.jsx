import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NavBar from './components/NavBar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OnboardPage from './pages/OnboardPage.jsx';
import VaultPage from './pages/VaultPage.jsx';
import TendersPage from './pages/TendersPage.jsx';
import TenderDetailPage from './pages/TenderDetailPage.jsx';

export default function App() {
  const { user, claims, loading } = useAuth();

  if (loading) {
    return (
      <div className="tv-loading-screen">
        <div className="tv-spinner" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Onboarding: auth required, no company yet */}
        <Route
          path="/onboard"
          element={
            <ProtectedRoute requireCompany={false}>
              <OnboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: auth + company required */}
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <VaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenders"
          element={
            <ProtectedRoute>
              <TendersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenders/:id"
          element={
            <ProtectedRoute>
              <TenderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : !claims?.companyId ? (
              <Navigate to="/onboard" replace />
            ) : (
              <Navigate to="/vault" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
