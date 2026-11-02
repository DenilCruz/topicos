import { ReportMetrics } from '../../types/reports.types';
import { StatTile } from '../charts/StatTile';
export function IndicadoresReportes({ metrics }: { metrics: ReportMetrics }) {
 const confianza = metrics.probabilidad_promedio_nlp;
 return (
      <div className="reporte-indicadores">
        <StatTile label="Total de tickets" value={String(metrics.total_historico)} hint="Histórico completo" />
        <StatTile label={`Incidentes · últimos ${metrics.ventana_dias} días`} value={String(metrics.volumen_ultimos_dias)} />
        <StatTile
          label="Probabilidad media del modelo"
          value={confianza !== null ? `${(confianza * 100).toFixed(1)}%` : '—'}
          hint={confianza !== null ? 'Probabilidad media de la clase predicha' : 'Aún no hay diagnósticos de ML'}
        />
        <StatTile label="Tickets con diagnóstico ML" value={String(metrics.tickets_con_diagnostico)} hint={`de ${metrics.total_historico} en total`} />
      </div>

);
}
