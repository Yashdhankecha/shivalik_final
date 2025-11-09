import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { GuestRoute } from './GuestRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import CommunityEventsPage from '../pages/CommunityEventsPage';
import UserDashboard from '../pages/UserDashboard';
import AdminPanel from '../pages/AdminPanel';
import CommunityDashboard from '../pages/CommunityDashboard';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import UsersManagement from '../pages/admin/UsersManagement';
import CommunitiesManagement from '../pages/admin/Communities';
import EventsManagement from '../pages/admin/Events';
import EventRegistrationApprovals from '../pages/admin/EventRegistrationApprovals';
import JoinRequests from '../pages/admin/JoinRequests';
import MarketplaceApprovals from '../pages/admin/MarketplaceApprovals';
import RoleChangeRequests from '../pages/admin/RoleChangeRequests';
import PulseApprovals from '../pages/admin/PulseApprovals';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
    // Handle both array and string role formats
    if (Array.isArray(info.userRoles)) {
      return info.userRoles;
    }
    if (info.role) {
      return [info.role];
    }
    return ['Guest'];
  } catch {
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/admin/users',
  Admin: '/admin/dashboard',
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // Check if user is authenticated
  const authToken = localStorage.getItem('auth_token');
  
  // If we're at the root path, determine where to redirect based on user role
  if (location.pathname === '/' || location.pathname === '') {
    // Special handling for admin token
    if (authToken && authToken.startsWith('admin-token')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Find the first matching default route
    for (const role of roles) {
      if (ROLE_DEFAULTS[role]) {
        return <Navigate to={ROLE_DEFAULTS[role]} replace />;
      }
    }
    
    // Fallback for all users
    return <Navigate to="/dashboard" replace />;
  }

  // If we are already on a page that belongs to the user – stay there
  return null; // let the child route render
};

/* ────── Main router ────── */
export { RedirectByRole };

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT - Show Landing Page with Hero Section */}
      <Route path="/" element={<RedirectByRole />} />
      
      {/* USER DASHBOARD - Default page for authenticated users */}
      <Route path="/dashboard" element={<UserDashboard />} />
      
      {/* COMMUNITY DASHBOARD - Individual community view */}
      <Route path="/community/:communityId" element={<GuestRoute><CommunityDashboard /></GuestRoute>} />
      
      {/* PROFILE & SETTINGS - Require authentication */}
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      
      {/* ADMIN PANEL - For admin users with child routes */}
      <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="communities" element={<CommunitiesManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="event-registrations" element={<EventRegistrationApprovals />} />
        <Route path="join-requests" element={<JoinRequests />} />
        <Route path="marketplace-approvals" element={<MarketplaceApprovals />} />
        <Route path="pulse-approvals" element={<PulseApprovals />} />
        <Route path="role-requests" element={<RoleChangeRequests />} />
      </Route>

      {/* PUBLIC COMMUNITY EVENTS PAGE */}
      <Route path="/events" element={<GuestRoute><CommunityEventsPage /></GuestRoute>} />

      {/* PUBLIC AUTH ROUTES */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicRoute>
            <OtpPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Global catch-all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
