import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routing/AppRoutes';
import themeConfig from '../theme.config';
import '@mantine/core/styles.css';

// Main App
const App = () => {
  useEffect(() => {
    // Apply theme class to body based on theme config
    if (themeConfig.theme === 'admin-bw') {
      document.body.classList.add('admin-bw-theme');
    } else {
      document.body.classList.remove('admin-bw-theme');
    }
  }, []);

  return (
    <MantineProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;