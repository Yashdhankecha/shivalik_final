import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special handling for admin token
  const authToken = localStorage.getItem('auth_token');
  const isAdminToken = authToken && authToken.startsWith('admin-token');
  const isAdminUser = user?.role === 'Admin' || user?.role === 'SuperAdmin' || isAdminToken;
  const isManagerUser = user?.role === 'Manager';
  
  // Allow admin users to access admin routes
  if (requiredRole && requiredRole === 'admin' && isAdminUser) {
    return <>{children}</>;
  }
  
  // Allow manager users to access manager routes
  if (requiredRole && requiredRole === 'manager' && (isManagerUser || isAdminUser)) {
    return <>{children}</>;
  }

  if (requiredRole && !isAdminUser && !isManagerUser) {
    // If a regular user tries to access admin routes, redirect to user dashboard
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // If a regular user tries to access manager routes, redirect to user dashboard
    if (requiredRole === 'manager') {
      return <Navigate to="/dashboard" replace />;
    }
    // For other role requirements
    if (user?.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};