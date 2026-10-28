import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/modules/autenticacion/context/AuthContext';
import { Navbar } from '@/shared/components/Navbar';
import { AppRouter } from '@/routes/AppRouter';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <AppRouter />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
