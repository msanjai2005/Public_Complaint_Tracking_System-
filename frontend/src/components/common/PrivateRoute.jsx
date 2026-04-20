import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdminOrStaff } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdminOrStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
