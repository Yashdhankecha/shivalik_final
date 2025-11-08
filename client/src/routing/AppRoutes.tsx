import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
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
import ReportsPage from '../pages/admin/Reports';
import AdminSettings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/Profile';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
    return Array.isArray(info.userRoles) ? info.userRoles : ['Guest'];
  } catch {
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/users',
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // Check if user is authenticated
  const authToken = localStorage.getItem('auth_token');
  
  // Always redirect to dashboard (whether authenticated or not)
  if (location.pathname === '/' || location.pathname === '') {
    return <Navigate to="/dashboard" replace />;
  }

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== '/' && location.pathname !== '') {
    return null; // let the child route render
  }

  // Find the first matching default route
  for (const role of roles) {
    if (ROLE_DEFAULTS[role]) {
      return <Navigate to={ROLE_DEFAULTS[role]} replace />;
    }
  }

  // Fallback for all users
  return <Navigate to="/dashboard" replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT - Show Landing Page with Hero Section */}
      <Route path="/" element={<LandingPage />} />
      
      {/* USER DASHBOARD - Default page for authenticated users */}
      <Route path="/dashboard" element={<UserDashboard />} />
      
      {/* COMMUNITY DASHBOARD - Individual community view */}
      <Route path="/community/:communityId" element={<CommunityDashboard />} />
      
      {/* PROFILE & SETTINGS */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* ADMIN PANEL - For admin users with child routes */}
      <Route path="/admin" element={<AdminPanel />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="communities" element={<CommunitiesManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
      
      {/* PUBLIC COMMUNITY EVENTS PAGE */}
      <Route path="/events" element={<CommunityEventsPage />} />

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