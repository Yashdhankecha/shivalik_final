import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  LayoutDashboard, Users, FileText, ShoppingBag,
  LogOut, ShieldCheck, Menu
} from 'lucide-react';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { cn } from '../lib/utils';

// Navigation items - Only the 4 moderation tabs
const getNavigationItems = (basePath: string) => {
  const moderationPath = basePath.includes('/moderation') ? basePath : `${basePath}/moderation`;
  return [
    { name: 'Overview', href: `${moderationPath}?tab=overview`, icon: LayoutDashboard, tab: 'overview' },
    { name: 'Users', href: `${moderationPath}?tab=users`, icon: Users, tab: 'users' },
    { name: 'Pulses', href: `${moderationPath}?tab=pulses`, icon: FileText, tab: 'pulses' },
    { name: 'Marketplace', href: `${moderationPath}?tab=marketplace`, icon: ShoppingBag, tab: 'marketplace' },
  ];
};

const ManagerPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { communityId } = useParams<{ communityId?: string }>();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has manager privileges
  useEffect(() => {
    if (user === undefined || user === null) {
      return;
    }
    
    // Check for direct manager role or admin role
    const hasDirectManagerRole = user?.userRoles?.includes('Manager') || 
                          user?.role === 'Manager' ||
                          (Array.isArray(user?.userRoles) && user.userRoles.includes('Manager'));
    
    const isAdminRole = user?.userRoles?.includes('Admin') || 
                       user?.role === 'Admin' ||
                       user?.userRoles?.includes('SuperAdmin') ||
                       user?.role === 'SuperAdmin';
    
    // Allow access if user has direct manager role or admin role
    if (!hasDirectManagerRole && !isAdminRole) {
      navigate('/');
    }
  }, [user, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Build menu items with communityId if available
  const basePath = communityId ? `/manager/${communityId}` : '/manager';
  const navigationItems = getNavigationItems(basePath);

  // Sidebar Navigation Component
  const SidebarNav = ({ onNavClick }: { onNavClick?: () => void }) => (
    <nav className="flex flex-col h-full min-h-screen md:min-h-0 bg-white">
      <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Manager Panel</h2>
            <p className="text-xs text-gray-600 hidden md:block">Community Management</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 md:py-4 min-h-0">
        <ul className="space-y-0.5 md:space-y-1 px-2">
          {navigationItems.map((item) => {
            // Check if current path matches and tab query param matches
            const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
            const isActive = location.pathname.includes('/moderation') && 
                            (item.tab === currentTab || (item.tab === 'overview' && !currentTab));
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors duration-200 text-sm md:text-base active:bg-gray-200 md:active:bg-transparent",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 md:w-5 md:h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-600")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Info in Sidebar */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Avatar className="w-9 h-9 md:w-10 md:h-10 border border-gray-300 flex-shrink-0">
            <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs md:text-sm">
              {user?.name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{user?.name || 'Manager'}</p>
            <p className="text-xs text-gray-500 truncate hidden md:block">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <SidebarNav />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="sr-only">Navigation Menu</div>
          <SidebarNav onNavClick={handleNavClick} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-3 sm:px-4 md:px-6">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Left: Hamburger Menu (Mobile) + Logo */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 -ml-1 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 active:bg-gray-200 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Logo - Mobile */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">Manager</span>
                </div>

                {/* Logo - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">Manager Panel</span>
                </div>
              </div>

              {/* Right: User Profile Dropdown */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 md:gap-2 hover:bg-gray-100 rounded-full p-1 md:p-1 md:pr-3 transition-colors border border-gray-300 active:bg-gray-200"
                  >
                    <Avatar className="w-7 h-7 md:w-8 md:h-8 border border-gray-300">
                      <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs md:text-sm">
                        {user?.name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm md:text-base font-medium text-gray-900">
                      {user?.name || 'Manager'}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">{user?.name || 'Manager'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerPanel;