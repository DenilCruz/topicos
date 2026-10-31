import React from 'react';

export interface TooltipState {
  x: number;
  y: number;
  title: string;
  lines: string[];
  color?: string;
}

/** Posición del cursor relativa al contenedor del gráfico (que debe ser position: relative). */
export const pointerPosition = (e: React.MouseEvent, container: HTMLElement | null) => {
  const rect = container?.getBoundingClientRect();
  return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
};

export const ChartTooltip: React.FC<{ state: TooltipState | null }> = ({ state }) => {
  if (!state) return null;
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        left: state.x + 14,
        top: state.y + 14,
        pointerEvents: 'none',
        zIndex: 10,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '8px 10px',
        fontSize: '0.8rem',
        minWidth: '140px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
        {state.color && <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: state.color, flexShrink: 0 }} />}
        {state.title}
      </div>
      {state.lines.map((line) => (
        <div key={line} style={{ color: 'var(--text-secondary)' }}>{line}</div>
      ))}
    </div>
  );
};
