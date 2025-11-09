import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  LayoutDashboard, Users, Building2, Calendar,
  LogOut, ChevronRight, ShieldCheck, Menu, UserCog, ShoppingBag, Shield
} from 'lucide-react';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { cn } from '../lib/utils';

// Navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Communities', href: '/admin/communities', icon: Building2 },
  { name: 'Add Moderators', href: '/admin/moderators', icon: Shield },
  { name: 'Join Requests', href: '/admin/join-requests', icon: UserCog },
  { name: 'Product Approvals', href: '/admin/marketplace-approvals', icon: ShoppingBag },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Event Registrations', href: '/admin/event-registrations', icon: Calendar },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has admin privileges
  useEffect(() => {
    // Check localStorage first for immediate redirect on page refresh
    const authToken = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (authToken && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        const userRole = parsedUser.role;
        
        // If user is not admin and trying to access admin panel, redirect
        if (userRole !== 'Admin' && userRole !== 'SuperAdmin') {
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
    
    // Also check user state when it's loaded
    if (user !== undefined && user !== null) {
      const userRole = user?.role;
      if (userRole !== 'Admin' && userRole !== 'SuperAdmin') {
        navigate('/login');
      }
    } else if (user === null && !authToken) {
      // If no user and no token, redirect to login
      navigate('/login');
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

  // Sidebar Navigation Component
  const SidebarNav = ({ onNavClick }: { onNavClick?: () => void }) => (
    <nav className="flex flex-col h-full min-h-screen md:min-h-0">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">Admin Panel</h2>
            <p className="text-xs text-gray-600">Management System</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-600")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Info in Sidebar */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-gray-400 flex-shrink-0">
            <AvatarFallback className="bg-gray-800 text-white font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-600 truncate">
              {user?.role === 'SuperAdmin' ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
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
          <SidebarNav onNavClick={handleNavClick} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-300 shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left: Hamburger Menu (Mobile) + Logo */}
              <div className="flex items-center gap-3">
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Logo - Mobile */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-bold text-black">Admin</span>
                </div>

                {/* Logo - Desktop (if needed) */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-lg font-bold text-black">Admin Panel</span>
                </div>
              </div>

              {/* Right: User Profile Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 rounded-full p-1 pr-2 sm:pr-3 transition-colors border border-gray-300"
                  >
                    <Avatar className="w-7 h-7 sm:w-9 sm:h-9 border-2 border-gray-400">
                      <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs sm:text-sm">
                        {user?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs sm:text-sm font-semibold text-black">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-600">{user?.role === 'SuperAdmin' ? 'Super Admin' : 'Admin'}</p>
                    </div>
                    <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 text-black transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-1 w-48 sm:w-56 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50">
                      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200">
                        <p className="font-semibold text-black text-sm sm:text-base">{user?.name || 'Admin User'}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{user?.email || 'admin@example.com'}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.role === 'SuperAdmin' ? 'Super Administrator' : 'Administrator'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 text-left hover:bg-gray-100 text-black flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                      >
                        <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-gray-50 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;