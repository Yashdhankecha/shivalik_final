import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Set a flag in localStorage to indicate guest access
    if (!isAuthenticated) {
      localStorage.setItem('guest_access', 'true');
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};