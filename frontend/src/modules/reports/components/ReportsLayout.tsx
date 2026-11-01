import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const SECTIONS = [
  { to: 'estaticos', label: 'Reportes Estáticos', hint: 'Historial y exportación' },
  { to: 'voz', label: 'Análisis por Voz (IA)', hint: 'Resumen ejecutivo narrado' },
  { to: 'dashboard', label: 'Dashboard Visual', hint: 'KPIs y gráficos' },
];

export const ReportsLayout: React.FC = () => (
  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <h1>Módulo de Reportes</h1>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
      {/* Submenú lateral; en pantallas estrechas pasa arriba */}
      <nav
        aria-label="Secciones de reportes"
        style={{
          flex: '0 0 230px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '0.5rem',
        }}
      >
        {SECTIONS.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              padding: '0.7rem 0.9rem',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
              borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
            })}
          >
            <span style={{ fontWeight: 500 }}>{section.label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{section.hint}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: '1 1 600px', minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  </div>
);
