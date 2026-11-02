import React from 'react';
import { ReportMetrics } from '../../types/reports.types';
import { ChartCard } from '../charts/ChartCard';
import { DonutChart, DonutSlice } from '../charts/DonutChart';
import { BarChart, BarDatum } from '../charts/BarChart';
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];
const ESTADOS_ORDEN = ['PENDIENTE_DIAGNOSTICO', 'DIAGNOSTICADO', 'EN_PROCESO', 'RESUELTO'];
const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', border: '1px dashed var(--border)', borderRadius: '6px', padding: '1rem' }}>
    {message}
  </div>
);

export function GraficosReportes({ metrics }: { metrics: ReportMetrics }) {
  const top = metrics.top_categorias;
  const otras = Math.max(0, metrics.tickets_con_diagnostico - top.reduce((sum, c) => sum + c.total, 0));
  const slices: DonutSlice[] = [
    ...top.map((c, i) => ({ label: c.categoria, value: c.total, color: SERIES[i] })),
    ...(otras > 0 ? [{ label: 'Otras categorías', value: otras, color: 'var(--series-other)' }] : []),
  ];

  const estados: BarDatum[] = [
    ...ESTADOS_ORDEN.map((estado) => ({ label: estado, value: metrics.distribucion_estado[estado] || 0 })),
    ...Object.entries(metrics.distribucion_estado)
      .filter(([estado]) => !ESTADOS_ORDEN.includes(estado))
      .map(([label, value]) => ({ label, value })),
  ];



return (
      <div className="reporte-graficos">
        <ChartCard
          title="Top categorías de falla"
          subtitle="Categorías predichas por el modelo NLP (top 3)"
          table={{ headers: ['Categoría', 'Tickets'], rows: slices.map((s) => [s.label, s.value]) }}
        >
          {slices.length >= 2 ? (
            <DonutChart slices={slices} centerLabel="diagnosticados" />
          ) : slices.length === 1 ? (
            <EmptyChart message={`Todos los tickets diagnosticados son de la categoría "${slices[0].label}" (${slices[0].value}).`} />
          ) : (
            <EmptyChart message="Aún no hay tickets diagnosticados por el modelo de ML. Las categorías aparecerán cuando se ejecute la inferencia." />
          )}
        </ChartCard>

        <ChartCard
          title="Tickets por estado"
          subtitle="Distribución actual de todos los tickets"
          table={{ headers: ['Estado', 'Tickets'], rows: estados.map((e) => [e.label, e.value]) }}
        >
          {metrics.total_historico > 0 ? <BarChart data={estados} /> : <EmptyChart message="Todavía no hay tickets registrados." />}
        </ChartCard>
      </div>

);
}
