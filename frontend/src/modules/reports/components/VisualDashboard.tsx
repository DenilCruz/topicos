import React, { useState } from 'react';
import { useReportMetrics } from '../hooks/useReportData';
import { StatTile } from './charts/StatTile';
import { ChartCard } from './charts/ChartCard';
import { DonutChart, DonutSlice } from './charts/DonutChart';
import { BarChart, BarDatum } from './charts/BarChart';

const WINDOWS = [7, 30, 90];
// Colores por posición en el top (el top siempre tiene a lo sumo 3 categorías + "Otras")
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];
const ESTADOS_ORDEN = ['PENDIENTE_DIAGNOSTICO', 'DIAGNOSTICADO', 'EN_PROCESO', 'RESUELTO'];

const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', border: '1px dashed var(--border)', borderRadius: '6px', padding: '1rem' }}>
    {message}
  </div>
);

export const VisualDashboard: React.FC = () => {
  const [dias, setDias] = useState(7);
  const { metrics, loading, error, refresh } = useReportMetrics(dias);

  if (loading && !metrics) return <p style={{ color: 'var(--text-secondary)' }}>Cargando métricas...</p>;

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem' }}>Dashboard Visual</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Métricas calculadas en el backend con el ORM de Django.</p>
      </div>
      {/* Controles en una sola fila, encima de todos los gráficos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }} htmlFor="ventana">Ventana</label>
        <select id="ventana" value={dias} onChange={(e) => setDias(Number(e.target.value))}>
          {WINDOWS.map((d) => <option key={d} value={d}>Últimos {d} días</option>)}
        </select>
        <button onClick={refresh} disabled={loading} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </div>
  );

  if (!metrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {header}
        <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>{error || 'Sin datos.'}</div>
      </div>
    );
  }

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

  const confianza = metrics.probabilidad_promedio_nlp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      {header}

      {error && <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>{error}</div>}

      {/* Fila de KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '1rem' }}>
        <StatTile label="Total de tickets" value={String(metrics.total_historico)} hint="Histórico completo" />
        <StatTile label={`Incidentes · últimos ${metrics.ventana_dias} días`} value={String(metrics.volumen_ultimos_dias)} />
        <StatTile
          label="Confianza promedio del modelo"
          value={confianza !== null ? `${(confianza * 100).toFixed(1)}%` : '—'}
          hint={confianza !== null ? 'Probabilidad media de la clase predicha' : 'Aún no hay diagnósticos de ML'}
        />
        <StatTile label="Tickets con diagnóstico ML" value={String(metrics.tickets_con_diagnostico)} hint={`de ${metrics.total_historico} en total`} />
      </div>

      {/* Cuadrícula de gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '1rem' }}>
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

      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Actualizado el {new Date(metrics.generado_en).toLocaleString()}
      </p>
    </div>
  );
};
