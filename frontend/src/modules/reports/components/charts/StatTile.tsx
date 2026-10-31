import React from 'react';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, hint }) => (
  <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
    {/* Cifra destacada en la sans del sistema, con dígitos proporcionales */}
    <span style={{ fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.1, color: 'var(--text-primary)' }}>{value}</span>
    {hint && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{hint}</span>}
  </div>
);
