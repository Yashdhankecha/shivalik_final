import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routing/AppRoutes';
import '@mantine/core/styles.css';

// Main App
const App = () => {
  return (
    <MantineProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
