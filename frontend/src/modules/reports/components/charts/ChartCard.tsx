import React, { useState } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  /** Filas para la vista de tabla accesible. */
  table: { headers: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, table, children }) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <section style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
        </div>
        <button
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
          style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}
        >
          {showTable ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </header>

      {showTable ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
              {table.headers.map((h) => <th key={h} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', fontVariantNumeric: 'tabular-nums' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
    </section>
  );
};
