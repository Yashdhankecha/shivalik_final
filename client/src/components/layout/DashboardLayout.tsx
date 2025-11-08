import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Burger,
  rem,
  Divider,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconMapPin,
  IconChartBar,
  IconBook,
  IconLogout,
  IconCaretDown,
  IconDeviceDesktop,
  IconSpeakerphone,
  IconCalendar,
  IconMessageCircle2,
  IconTrendingUp
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { User, Users2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Navigation array
const navigation = [
  { name: 'People', href: '/users', icon: IconUsers },
  {
    name: 'Territory',
    href: '/territory',
    icon: IconMapPin,
    subItems: [
      { name: 'Dashboard', href: '/territory/dashboard' },
      { name: 'Projects', href: '/territory/project' },
      { name: 'Land', href: '/territory/land/dashboard' },
      { name: 'Vendors', href: '/territory/vendor/dashboard' },
      { name: 'Store', href: '/territory/store/dashboard' },
      { name: 'Institute', href: '/territory/institute/dashboard' },
    ],
  },
  { name: 'Desk', href: '/follow-up', icon: IconDeviceDesktop },
  { name: 'Event', href: '/event', icon: IconCalendar },
  { name: 'Knowledge', href: '/article-listing', icon: IconBook },
  { name: 'Channel Sales', href: '/channel-sales', icon: IconChartBar },
  {
    name: 'Campaign',
    href: '/campaign-list',
    icon: IconSpeakerphone,
    subItems: [
      { name: 'Campaign', href: '/campaign-list' },
      { name: 'Add Campaign', href: '/campaign-add' },
    ],
  },
  {
    name: 'Employee',
    href: '/employee/dashboard',
    icon: Users2,
    subItems: [
      { name: 'Dashboard', href: '/employee/dashboard' },
      { name: 'Employee List', href: '/employee/employee-list' },
      // { name: 'Attendance', href: '/employee/attendance' },
      { name: 'Designation', href: '/employee/designation' },
      { name: 'Department', href: '/employee/department' },
      { name: 'Branch', href: '/employee/branch' },
      { name: 'Seating Office', href: '/employee/seating-office' },
      { name: 'Shift Management', href: '/employee/shift-management' },
      { name: 'Jobs', href: '/employee/jobs' },
      { name: 'Report', href: '/employee/report' },
    ],
  },
  {
    name: 'Feedback',
    href: '/feedback-list',
    icon: IconMessageCircle2,
    subItems: [
      { name: 'Feedback Modules', href: '/feedback-modules-list' },
      { name: 'Feedback List', href: '/feedback-list' },
    ],
  },
  {
    name: 'Growth Partner',
    href: '/growth-partner-list',
    icon: IconTrendingUp,
  },
];

// Mapping of roles allowed tabs
const roleToTabs: Record<string, string[]> = {
  SuperAdmin: navigation.map((item) => item.name), // all
  LandManager: ['Desk', 'Territory'],
  LandExecutive: ['Desk', 'Territory'],
  FundManager: ['Desk'],
  FundExecutive: ['Desk'],
  ProjectSalesManager: ['Desk'],
  ProjectPreSales: ['Desk'],
  ProjectSiteSales: ['Desk'],
  EventAdmin: ['Event'],
  KnowledgeAdmin: ['Knowledge'],
  CPManager: ['Desk', 'Channel Sales'],
  CPExecutive: ['Desk', 'Channel Sales'],
  CampaignAdmin: ['Campaign'],
  VendorAdmin: ['Territory'],
  HRManager: ['Employee'],
  HRExecutive: ['Employee'],
  CSWebsiteAdmin: ['Desk'],
  FurnitureManager: ['Desk', 'Territory'],
  FurnitureSalesExecutive: ['Desk', 'Territory'],
  FurnitureB2BAdmin: ['Desk', 'Territory'],
  FurnitureDealerAdmin: ['Desk', 'Territory'],
  GrowthPartnerAdmin: ['Growth Partner'],
  InstituteManager: ['Desk'],
  InstituteExecutive: ['Desk']
};

// Filter navigation based on user roles
const getFilteredNavigation = (roles: string[] = []) => {
  if (roles.includes('SuperAdmin')) {
    return navigation; // full access
  }

  const allowed = new Set<string>();
  const landRestricted = roles?.some((r) =>
    ['LandManager', 'LandExecutive']?.includes(r)
  );

  const furnitureRestricted = roles?.some((role) =>
    ['FurnitureManager', 'FurnitureSalesExecutive', 'FurnitureB2BAdmin', 'FurnitureDealerAdmin']?.includes(role)
  );

  const vendorRestricted = roles.includes('VendorAdmin');

  roles?.forEach((role) => {
    const tabs = roleToTabs[role];
    if (tabs) {
      tabs?.forEach((tab) => allowed.add(tab));
    }
  });

  return navigation
    ?.filter((item) => {
      // Allow Feedback section for all roles
      if (item.name === 'Feedback') return true;
      return allowed?.has(item.name);
    })
    ?.map((item) => {
      if (item?.name === 'Territory') {
        const subItems: { name: string; href: string }[] = [];

        // Add Land tab if land-related role
        if (landRestricted) {
          subItems?.push({ name: 'Land', href: '/territory/land/dashboard' });
        }

        // Add Store tab if furniture-related role
        if (furnitureRestricted) {
          subItems?.push({ name: 'Store', href: '/territory/store/dashboard' });
        }

        // Add Vendor tabs if vendor role
        if (vendorRestricted) {
          subItems?.push(
            { name: 'Dashboard', href: '/territory/dashboard' },
            { name: 'Vendors', href: '/territory/vendor/dashboard' }
          );
        }

        // Only return if we actually have subItems
        if (subItems?.length > 0) {
          return { ...item, subItems };
        }
      }

      // Alllow Feedback Modules section only for SuperAdmin role
      if (item?.name === 'Feedback') {
        return {
          ...item,
          subItems: item?.subItems?.filter(
            (sub) => sub?.name !== 'Feedback Modules'
          ),
        };
      }

      return item;
    });
};

export const DashboardLayout = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, logout }: any = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(() => {
    const storedPath = localStorage.getItem('lastActivePath');
    return storedPath || '/users'; // Default to '/users' if no stored path
  });
  const [tabOpenStates, setTabOpenStates] = useState<{ [key: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem('tabOpenStates') || '{}');
    } catch {
      return navigation.reduce((acc, item) => (item.subItems ? { ...acc, [item.href]: false } : acc), {});
    }
  });
  const [logoutModal, setLogoutModal] = useState(false);
  const isInitialMount = useRef(true);

  let userInfo;
  // Retrieve user roles from localStorage, fallback to user?.role
  let userRoles: string[] = [];
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    userRoles = Array.isArray(userInfo.userRoles) ? userInfo.userRoles : [];
  } catch (error) {
    console.error('Error parsing userInfo from localStorage:', error);
  }
  const effectiveRoles = userRoles.length > 0 ? userRoles : (user?.role ? [user?.role] : []);

  // Apply filtered navigation based on roles
  const filteredNavigation = getFilteredNavigation(effectiveRoles);

  useEffect(() => {
    if (isInitialMount.current) {
      const storedPath = localStorage.getItem('lastActivePath');
      const isValidPath = filteredNavigation.some(
        (item) =>
          item.href === storedPath ||
          (item.subItems && item.subItems.some((sub) => sub.href === storedPath))
      );
      if (storedPath && isValidPath && storedPath !== location.pathname) {
        navigate(storedPath, { replace: true });
      } else if (!isValidPath && storedPath) {
        // If stored path is invalid, clear it and navigate to default
        localStorage.setItem('lastActivePath', '/users');
        navigate('/users', { replace: true });
      }
      isInitialMount.current = false;
    }
  }, [navigate, filteredNavigation]);

  useEffect(() => {
    if (activePath !== location.pathname) {
      setActivePath(location.pathname);
      localStorage.setItem('lastActivePath', location.pathname);
    }

    const updatedTabOpenStates = { ...tabOpenStates };
    let hasChanges = false;

    filteredNavigation.forEach((item) => {
      if (item.subItems) {
        const isSubActive = item.subItems.some((sub) => location.pathname === sub.href);
        const isParentActive = location.pathname === item.href;
        const shouldBeOpen = isSubActive || isParentActive;
        if (updatedTabOpenStates[item.href] !== shouldBeOpen) {
          updatedTabOpenStates[item.href] = shouldBeOpen;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTabOpenStates(updatedTabOpenStates);
      localStorage.setItem('tabOpenStates', JSON.stringify(updatedTabOpenStates));
    }
  }, [location.pathname, activePath, filteredNavigation]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('lastActivePath');
    localStorage.removeItem('tabOpenStates');
    navigate('/login');
  };

  const handleTabClick = (item: typeof navigation[0]) => {
    if (item.subItems) {
      setTabOpenStates((prev) => {
        const isCurrentlyOpen = !!prev[item.href];
        const newState = { ...prev, [item.href]: !isCurrentlyOpen };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        // When opening a menu with sub-items, navigate to its first sub-item
        if (!isCurrentlyOpen && item.subItems) {
          const targetPath = item.subItems[0].href;
          if (location.pathname !== targetPath) {
            navigate(targetPath);
            setActivePath(targetPath);
            localStorage.setItem('lastActivePath', targetPath);
          }
        }
        // When closing, do not navigate away; simply collapse the menu
        return newState;
      });
    } else {
      navigate(item.href);
      setActivePath(item.href);
      localStorage.setItem('lastActivePath', item.href);
      close();
    }
  };

  const handleSubItemClick = (href: string) => {
    navigate(href);
    setActivePath(href);
    localStorage.setItem('lastActivePath', href);
    // Ensure parent menu stays open
    const parentItem = filteredNavigation.find((item) =>
      item.subItems?.some((sub) => sub.href === href)
    );
    if (parentItem) {
      setTabOpenStates((prev) => {
        const newState = { ...prev, [parentItem.href]: true };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        return newState;
      });
    }
    close();
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const hasSubItems = !!item.subItems;
    const isActive =
      activePath === item.href ||
      (hasSubItems && (item.subItems?.some((sub) => activePath === sub.href) || tabOpenStates[item.href]));

    return (
      <li
        style={{
          display: 'block',
          width: '100%',
          padding: rem(12),
          borderRadius: rem(8),
          textDecoration: 'none',
          color: isActive ? '#ffffff' : '#9ca3af',
          backgroundColor: isActive ? '#2a4365' : 'transparent',
          fontWeight: isActive ? 600 : 500,
          fontSize: rem(14),
          transition: 'all 0.3s ease-in-out',
          listStyle: 'none',
          position: 'relative',
          boxShadow: hasSubItems && tabOpenStates[item.href] ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
          borderLeft: isActive ? '4px solid #60a5fa' : 'none',
          marginBottom: hasSubItems ? rem(4) : 0,
          minHeight: hasSubItems ? rem(48) : 'auto',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isActive && !hasSubItems) {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive && !hasSubItems) {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        onClick={() => handleTabClick(item)}
      >
        <Group gap="sm" style={{ position: 'relative', zIndex: 1 }}>
          <item.icon size={20} />
          <Text size="sm">{item.name}</Text>
          {hasSubItems && (
            <Box
              style={{
                transition: 'transform 0.3s ease',
                transform: tabOpenStates[item.href] ? 'rotate(180deg)' : 'rotate(0deg)',
                marginLeft: 'auto',
              }}
            >
              <IconCaretDown size={16} />
            </Box>
          )}
        </Group>
        {hasSubItems && tabOpenStates[item.href] && (
          <ul
            style={{
              marginTop: 20,
              padding: 'rem(12) 0 0 rem(28)',
              margin: 'rem(8) 0 0 0',
              listStyle: 'none',
              background: 'linear-gradient(135deg, #2a4365, #3b82f6)',
              borderRadius: rem(6),
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              animation: 'slideDown 0.3s ease-out',
            }}
            onAnimationEnd={(e) => (e.target as HTMLElement).style.animation = 'none'}
          >
            {item.subItems.map((subItem) => (
              <li
                key={subItem.name}
                style={{
                  padding: rem(10),
                  color: activePath === subItem.href ? '#ffffff' : '#e0e7ff',
                  backgroundColor: activePath === subItem.href ? '#1e40af' : 'transparent',
                  fontSize: rem(13),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: rem(4),
                  marginBottom: rem(8),
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click
                  handleSubItemClick(subItem.href);
                }}
                onMouseEnter={(e) => {
                  if (activePath !== subItem.href) {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePath !== subItem.href) {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.color = '#e0e7ff';
                  }
                }}
              >
                <Box
                  style={{
                    width: rem(4),
                    height: rem(4),
                    backgroundColor: activePath === subItem.href ? '#60a5fa' : 'transparent',
                    borderRadius: '50%',
                    marginRight: rem(10),
                  }}
                />
                {subItem.name}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <AppShell
      header={{ height: { base: 60, sm: 70 } }}
      navbar={{
        width: { base: 280, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 'sm', sm: 'md', lg: 'lg' }}
      styles={(theme) => ({
        main: {
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 70px)',
          '@keyframes slideDown': {
            '0%': { maxHeight: 0, opacity: 0 },
            '100%': { maxHeight: '200px', opacity: 1 },
          },
        },
      })}
    >
      <Modal
        opened={logoutModal}
        onClose={() => setLogoutModal(false)}
        title={<h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>}
        centered
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-sm">
            Are you sure you want to log out?
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      <AppShell.Header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Group h="100%" px={{ base: 'md', sm: 'xl' }} justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#6c757d" />
            <Text
              size="xl"
              fw={700}
              c="#111827"
              hiddenFrom="base"
              visibleFrom="xs"
            >
              Welcome back, {userInfo.firstName || 'User'} {userInfo.lastName || ''}
            </Text>
          </Group>

          <Group gap="md">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar
                      size={36}
                      radius="xl"
                      src={user?.avatar}
                      style={{ backgroundColor: '#e5e7eb' }}
                    />
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={500} c="#111827">
                        {userInfo.firstName || 'User'} {userInfo.lastName || ''}
                      </Text>
                      <Text size="xs" c="#6b7280">
                        {effectiveRoles.join(', ') || 'No Role'}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={() => setLogoutModal(true)}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: '#1f2937',
          border: 'none',
        }}
      >
        <AppShell.Section>
          <Group mb="xl" px="xs">
            <Box
              style={{
                width: rem(40),
                height: rem(40),
                backgroundColor: '#ffffff',
                borderRadius: rem(8),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="lg" fw={700} c="#1f2937">
                R
              </Text>
            </Box>
            <Text size="lg" fw={700} c="#ffffff">
              R-OS
            </Text>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          <div
            style={{
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <ul style={{ padding: 0, margin: 0 }}>
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="md" color="#374151" />
          <Box px="xs">
            <Text size="xs" c="#6b7280" mb={4}>
              Version
            </Text>
            <Text size="sm" fw={500} c="#9ca3af">
              v1.0.0
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};