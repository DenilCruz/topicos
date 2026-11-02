import { useHistorialReportes } from '../hooks/useHistorialReportes';
import { CabeceraReporte } from './comunes/CabeceraReporte';
import { FiltrosHistorial } from './estaticos/FiltrosHistorial';
import { TablaHistorial } from './estaticos/TablaHistorial';
import { PaginacionHistorial } from './estaticos/PaginacionHistorial';
export function StaticReports() {
  const datos = useHistorialReportes();
  const desactivado = datos.exporting !== null || datos.loading || !datos.totalElements;
  return <div className="reporte-vista"><CabeceraReporte titulo="Reportes estáticos" descripcion="Historial de incidentes con exportación del resultado filtrado.">
    <button className="reporte-exportar-pdf" onClick={datos.handlePdf} disabled={desactivado}>{datos.exporting === 'pdf' ? 'Generando…' : 'Exportar PDF'}</button>
    <button className="reporte-exportar-csv" onClick={datos.handleCsv} disabled={desactivado}>{datos.exporting === 'csv' ? 'Generando…' : 'Exportar CSV'}</button>
  </CabeceraReporte><FiltrosHistorial datos={datos} />
    {datos.error && <p className="reporte-error" role="alert">{datos.error}</p>}
    {!datos.error && <><TablaHistorial tickets={datos.tickets} loading={datos.loading} /><PaginacionHistorial datos={datos} /></>}
  </div>;
}
