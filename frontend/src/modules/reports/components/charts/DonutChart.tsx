import React, { useRef, useState } from 'react';
import { ChartTooltip, TooltipState, pointerPosition } from './ChartTooltip';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel: string;
}

const SIZE = 200;
const OUTER = 92;
const INNER = 60;
const CENTER = SIZE / 2;

const point = (radius: number, angle: number) => [
  CENTER + radius * Math.cos(angle - Math.PI / 2),
  CENTER + radius * Math.sin(angle - Math.PI / 2),
];

const arcPath = (start: number, end: number) => {
  // Un arco SVG no puede cerrar 360°: se recorta un poco el segmento único
  const sweep = Math.min(end - start, Math.PI * 2 - 0.0001);
  const large = sweep > Math.PI ? 1 : 0;
  const [x1, y1] = point(OUTER, start);
  const [x2, y2] = point(OUTER, start + sweep);
  const [x3, y3] = point(INNER, start + sweep);
  const [x4, y4] = point(INNER, start);
  return `M ${x1} ${y1} A ${OUTER} ${OUTER} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER} ${INNER} 0 ${large} 0 ${x4} ${y4} Z`;
};

export const DonutChart: React.FC<DonutChartProps> = ({ slices, centerLabel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const pct = (v: number) => (total ? `${((v / total) * 100).toFixed(1)}%` : '0%');

  let angle = 0;
  const arcs = slices.map((slice) => {
    const start = angle;
    angle += (slice.value / total) * Math.PI * 2;
    return { ...slice, path: arcPath(start, angle) };
  });

  const show = (e: React.MouseEvent, slice: DonutSlice) => {
    setActive(slice.label);
    setTooltip({
      ...pointerPosition(e, containerRef.current),
      title: slice.label,
      lines: [`${slice.value} ticket(s)`, `${pct(slice.value)} del total`],
      color: slice.color,
    });
  };
  const hide = () => {
    setActive(null);
    setTooltip(null);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={`Gráfico circular: ${centerLabel}`} style={{ flexShrink: 0 }}>
        {arcs.map((arc) => (
          <path
            key={arc.label}
            d={arc.path}
            fill={arc.color}
            // Trazo del color de la superficie: separa segmentos con un hueco de 2px
            stroke="var(--bg-secondary)"
            strokeWidth={2}
            opacity={active && active !== arc.label ? 0.45 : 1}
            style={{ transition: 'opacity 0.15s', cursor: 'default' }}
            onMouseMove={(e) => show(e, arc)}
            onMouseLeave={hide}
          />
        ))}
        <text x={CENTER} y={CENTER - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="600">
          {total}
        </text>
        <text x={CENTER} y={CENTER + 18} textAnchor="middle" fill="var(--text-secondary)" fontSize="11">
          {centerLabel}
        </text>
      </svg>

      {/* Leyenda con valores: la identidad no depende solo del color ni del tooltip */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', minWidth: '180px', flex: 1 }}>
        {slices.map((slice) => (
          <li
            key={slice.label}
            onMouseEnter={() => setActive(slice.label)}
            onMouseLeave={() => setActive(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: active && active !== slice.label ? 0.55 : 1 }}
          >
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: slice.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{slice.label}</span>
            <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {slice.value} · {pct(slice.value)}
            </span>
          </li>
        ))}
      </ul>

      <ChartTooltip state={tooltip} />
    </div>
  );
};
