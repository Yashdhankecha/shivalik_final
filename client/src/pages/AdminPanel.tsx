import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText, Settings,
  Bell, Search, LogOut, ChevronRight, TrendingUp, UserPlus,
  ShieldCheck, Activity, BarChart3, Home, MessageSquare
} from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Determine active section based on URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/communities')) return 'communities';
    if (path.includes('/admin/events')) return 'events';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/settings')) return 'settings';
    if (path.includes('/admin/profile')) return 'profile';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'Users Management', icon: Users, path: '/admin/users' },
    { id: 'communities', label: 'Communities', icon: Building2, path: '/admin/communities' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/admin/events' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'profile', label: 'Profile', icon: UserPlus, path: '/admin/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Top Navigation Bar */}
      <nav className="bg-black/40 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-emerald-900/30">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
                <p className="text-xs text-gray-400">Real Estate Community Management</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-900/30 relative text-emerald-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-emerald-900/30 rounded-full p-1 pr-3 transition-colors border border-emerald-800/30"
                >
                  <Avatar className="w-9 h-9 border-2 border-emerald-500">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-800 text-white font-semibold">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-emerald-100">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-emerald-300 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-emerald-900/40 py-2">
                    <div className="px-4 py-3 border-b border-emerald-900/30">
                      <p className="font-semibold text-emerald-100">{user?.name || 'Admin User'}</p>
                      <p className="text-sm text-gray-400">{user?.email || 'admin@example.com'}</p>
                    </div>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-emerald-900/30 flex items-center gap-3 text-emerald-100"
                      onClick={() => navigate('/admin/profile')}
                    >
                      <UserPlus className="w-4 h-4 text-emerald-500" />
                      <span>Profile</span>
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-emerald-900/30 flex items-center gap-3 text-emerald-100"
                      onClick={() => navigate('/admin/settings')}
                    >
                      <Settings className="w-4 h-4 text-emerald-500" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-red-900/30 text-red-400 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-full">
        {/* LEFT SIDEBAR - Admin Menu */}
        <aside className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-emerald-900/30 h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg'
                      : 'text-emerald-100 hover:bg-emerald-900/30 border border-emerald-900/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-900/50">
          {/* Render child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;