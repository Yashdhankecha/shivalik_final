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

import Moderators from '../pages/admin/Moderators';
import EventsManagement from '../pages/admin/Events';
import JoinRequests from '../pages/admin/JoinRequests';
import MarketplaceApprovals from '../pages/admin/MarketplaceApprovals';

import CommunityJoinRequests from '../pages/admin/CommunityJoinRequests';

import RoleChangeRequests from '../pages/admin/RoleChangeRequests';
import EventRegistrationApprovals from '../pages/admin/EventRegistrationApprovals';

// Manager Pages
import ManagerPanel from '../pages/ManagerPanel';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerJoinRequests from '../pages/manager/JoinRequests';
import ManagerMembers from '../pages/manager/Members';
import ManagerEvents from '../pages/manager/ManagerEvents';
import ManagerPosts from '../pages/manager/ManagerPosts';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
    console.log('User info from localStorage:', info);
    // Handle both array and string role formats
    if (Array.isArray(info.userRoles)) {
      return info.userRoles;
    }
    if (info.role) {
      return [info.role];
    }
    // Special case for admin token
    const authToken = localStorage.getItem('auth_token');
    if (authToken && authToken.startsWith('admin-token')) {
      return ['Admin'];
    }
    return ['Guest'];
  } catch (error) {
    console.error('Error parsing user data:', error);
    // Special case for admin token even when parsing fails
    const authToken = localStorage.getItem('auth_token');
    if (authToken && authToken.startsWith('admin-token')) {
      return ['Admin'];
    }
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/admin/users',
  Admin: '/admin/dashboard',
  Manager: '/manager/dashboard'
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();
  console.log('User roles:', roles);

  // Check if user is authenticated
  const authToken = localStorage.getItem('auth_token');
  console.log('Auth token:', authToken);
  
  // If we're at the root path, determine where to redirect based on user role
  if (location.pathname === '/' || location.pathname === '') {
    // Special handling for admin token
    if (authToken && authToken.startsWith('admin-token')) {
      console.log('Redirecting admin user to /admin/dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Find the first matching default route
    for (const role of roles) {
      if (ROLE_DEFAULTS[role]) {
        console.log(`Redirecting ${role} user to ${ROLE_DEFAULTS[role]}`);
        return <Navigate to={ROLE_DEFAULTS[role]} replace />;
      }
    }
    
    // Fallback for all users
    console.log('Redirecting to /dashboard (fallback)');
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
      <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="communities" element={<CommunitiesManagement />} />

        <Route path="moderators" element={<Moderators />} />
        <Route path="join-requests" element={<JoinRequests />} />
        <Route path="marketplace-approvals" element={<MarketplaceApprovals />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="event-registrations" element={<EventRegistrationApprovals />} />

        <Route path="role-requests" element={<RoleChangeRequests />} />
        <Route path="join-requests" element={<CommunityJoinRequests />} />
      </Route>
      
      {/* MANAGER PANEL - For manager users with child routes */}
      <Route path="/manager" element={<PrivateRoute requiredRole="manager"><ManagerPanel /></PrivateRoute>}>
        <Route index element={<ManagerDashboard />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="join-requests" element={<ManagerJoinRequests />} />
        <Route path="members" element={<ManagerMembers />} />
        <Route path="events" element={<ManagerEvents />} />
        <Route path="posts" element={<ManagerPosts />} />
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