import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/autenticacion/hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Core App</h2>
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/tickets" style={{ color: 'var(--text-primary)' }}>Tickets</Link>
            <Link to="/reportes" style={{ color: 'var(--text-primary)' }}>Reportes</Link>
            <Link to="/bonita" style={{ color: 'var(--text-primary)' }}>Bonita BPM</Link>
            <Link to="/nlp" style={{ color: 'var(--text-primary)' }}>NLP</Link>
            <Link to="/logs" style={{ color: 'var(--text-primary)' }}>Logs</Link>
          </div>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              Iniciar Sesión
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};
