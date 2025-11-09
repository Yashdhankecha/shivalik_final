import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UserRouteProps {
  children: React.ReactNode;
}

/**
 * UserRoute - Prevents admin users from accessing normal user routes
 * Redirects admin users to admin dashboard
 */
export const UserRoute = ({ children }: UserRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin or manager
  const authToken = localStorage.getItem('auth_token');
  const isAdminToken = authToken && authToken.startsWith('admin-token');
  const isAdminUser = user?.role === 'Admin' || user?.role === 'SuperAdmin' || isAdminToken;
  const isManagerUser = user?.role === 'Manager';
  
  // If admin user tries to access user dashboard, redirect to admin dashboard
  if (isAdminUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If manager user tries to access user dashboard, redirect to manager dashboard
  if (isManagerUser) {
    return <Navigate to="/manager" replace />;
  }
  
  // Allow regular users to access
  return <>{children}</>;
};

