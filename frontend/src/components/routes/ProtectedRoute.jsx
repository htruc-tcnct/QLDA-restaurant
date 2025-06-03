import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, loadUserFromToken, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // If token exists but not authenticated, try to load user from token
      if (!isAuthenticated && localStorage.getItem('token')) {
        await loadUserFromToken();
      }
      setIsChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, loadUserFromToken]);

  // Show nothing while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 