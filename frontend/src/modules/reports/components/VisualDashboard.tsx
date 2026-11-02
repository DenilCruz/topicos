import { useState } from 'react';
import { useReportMetrics } from '../hooks/useReportData';
import { CabeceraReporte } from './comunes/CabeceraReporte';
import { IndicadoresReportes } from './dashboard/IndicadoresReportes';
import { GraficosReportes } from './dashboard/GraficosReportes';
export function VisualDashboard() {
  const [dias, cambiarDias] = useState(7);
  const { metrics, loading, error, refresh } = useReportMetrics(dias);
  return <div className="reporte-vista" aria-busy={loading}>
    <CabeceraReporte titulo="Dashboard visual" descripcion="Indicadores calculados a partir de los tickets registrados.">
      <label>Ventana<select value={dias} onChange={e => cambiarDias(Number(e.target.value))}>
        {[1, 7, 30, 90].map(valor => <option key={valor} value={valor}>Últimos {valor} días</option>)}</select></label>
      <button disabled={loading} onClick={refresh}>{loading ? 'Actualizando…' : 'Actualizar'}</button>
    </CabeceraReporte>
    {error && <p role="alert" className="reporte-error">{error}</p>}
    {loading && <p role="status">Consultando métricas…</p>}
    {metrics && <><IndicadoresReportes metrics={metrics} /><GraficosReportes metrics={metrics} />
      <p className="reporte-pie">Actualizado: {new Date(metrics.generado_en).toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}.
        La ventana seleccionada se aplica al indicador de incidentes recientes; los demás indicadores muestran el histórico.</p></>}
  </div>;
}
