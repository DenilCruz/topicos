import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditLogItem } from '../types/logs.types';
import { exportarLogs } from '../utils/exportarLogs';
import { FiltrosLogs } from './FiltrosLogs';
import { ResumenLogs } from './ResumenLogs';
import { TablaLogs } from './TablaLogs';
import { DetalleLog } from './DetalleLog';
import { PaginacionLogs } from './PaginacionLogs';
import '../styles/logs.css';

export function LogsDashboard() {
  const { datos, loading, error, filters, updateFilters, refresh, actualizado } = useAuditLogs();
  const [seleccionado, seleccionar] = useState<AuditLogItem | null>(null);
  function actualizar() { seleccionar(null); refresh(); }
  return <main className="logs-pagina">
    <header className="logs-cabecera"><div><span className="logs-subtitulo">Trazabilidad del sistema</span>
      <h1>Módulo de Auditoría y Logs</h1><p>Consulta de peticiones HTTP registradas en la base de datos.</p></div>
      <div className="logs-acciones"><span>{actualizado ? `Última consulta: ${actualizado.toLocaleTimeString('es-BO')}` : 'Sin consultar'}</span>
        <button disabled={loading || !datos?.results.length} onClick={() => datos && exportarLogs(datos.results)}>CSV · página visible</button>
        <button className="logs-primario" disabled={loading} onClick={actualizar}>{loading ? 'Consultando…' : 'Refrescar'}</button></div>
    </header>
    <FiltrosLogs filtros={filters} opciones={datos?.opciones} cargando={loading}
      aplicar={cambios => { seleccionar(null); updateFilters(cambios); }} />
    {loading && <p role="status">Consultando registros…</p>}
    {error && <div className="logs-error" role="alert">{error}<button onClick={actualizar}>Reintentar</button></div>}
    {datos && !loading && !error && <><ResumenLogs resumen={datos.resumen} />
      <TablaLogs registros={datos.results} seleccionado={seleccionado?.id} seleccionar={seleccionar} />
      <PaginacionLogs datos={datos} cargando={loading} cambiar={page => { seleccionar(null); updateFilters({ page }); }} />
      {seleccionado && <DetalleLog key={seleccionado.id} registro={seleccionado} cerrar={() => seleccionar(null)} />}</>}
  </main>;
}
