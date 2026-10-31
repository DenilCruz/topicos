import React, { useRef, useState } from 'react';
import { ChartTooltip, TooltipState, pointerPosition } from './ChartTooltip';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  /** Una sola serie: un solo tono. */
  color?: string;
  unit?: string;
}

/** Barras horizontales: las etiquetas largas (p. ej. PENDIENTE_DIAGNOSTICO) se leen sin rotarlas. */
export const BarChart: React.FC<BarChartProps> = ({ data, color = 'var(--series-1)', unit = 'ticket(s)' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {data.map((d) => (
        <div
          key={d.label}
          // Toda la fila es el área de hover, no solo la barra
          onMouseMove={(e) => {
            setActive(d.label);
            setTooltip({
              ...pointerPosition(e, containerRef.current),
              title: d.label,
              lines: [`${d.value} ${unit}`, `${total ? ((d.value / total) * 100).toFixed(1) : 0}% del total`],
              color,
            });
          }}
          onMouseLeave={() => {
            setActive(null);
            setTooltip(null);
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(110px, 38%) 1fr 2.5rem',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '6px 4px',
            borderRadius: '4px',
            backgroundColor: active === d.label ? 'rgba(148, 163, 184, 0.08)' : 'transparent',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>{d.label}</span>
          <div style={{ height: '18px', borderLeft: '1px solid var(--border)' }}>
            <div
              style={{
                height: '100%',
                width: `${(d.value / max) * 100}%`,
                minWidth: d.value > 0 ? '3px' : 0,
                backgroundColor: color,
                // Extremo de datos redondeado, anclado a la línea base
                borderRadius: '0 4px 4px 0',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {d.value}
          </span>
        </div>
      ))}
      <ChartTooltip state={tooltip} />
    </div>
  );
};
