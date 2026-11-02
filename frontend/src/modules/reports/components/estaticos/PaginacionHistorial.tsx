import { useHistorialReportes } from '../../hooks/useHistorialReportes';
export function PaginacionHistorial({ datos }: { datos: ReturnType<typeof useHistorialReportes> }) {
  return <footer className="reporte-paginacion"><label>Filas por página
    <select value={datos.filters.size} onChange={e => datos.updateFilters({ size: Number(e.target.value) })}>
      {[10, 25, 50].map(valor => <option key={valor}>{valor}</option>)}</select>
    <span>{datos.totalElements} incidentes</span></label>
    <div><button disabled={datos.loading || datos.page <= 1} onClick={() => datos.cambiarPagina(datos.page - 1)}>Anterior</button>
      <span>Página {datos.totalPages ? datos.page : 0} de {datos.totalPages}</span>
      <button disabled={datos.loading || datos.page >= datos.totalPages} onClick={() => datos.cambiarPagina(datos.page + 1)}>Siguiente</button></div>
  </footer>;
}
