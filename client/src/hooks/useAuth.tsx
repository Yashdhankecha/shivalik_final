import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Keep as string for PrivateRoute compatibility
  userRoles?: string[]; // Optional array for flexibility
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('userInfo');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Handle both new and existing user data formats
        const transformedUser: User = {
          id: parsedUser.id || parsedUser._id || '',
          name: parsedUser.name || (parsedUser.firstName && parsedUser.lastName ? parsedUser.firstName + ' ' + parsedUser.lastName : 'User'),
          email: parsedUser.email || '',
          phone: parsedUser.phone || parsedUser.mobileNumber || '',
          role: parsedUser.role || (parsedUser.userRoles ? parsedUser.userRoles.join(',') : 'user'),
          avatar: parsedUser.avatar || ''
        };
        setUser(transformedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivePath');
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};