import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Check if user is admin and redirect accordingly
    const authToken = localStorage.getItem('auth_token');
    const isAdminToken = authToken && authToken.startsWith('admin-token');
    const isAdminUser = user?.role === 'Admin' || user?.role === 'SuperAdmin' || isAdminToken;
    
    if (isAdminUser) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
