import { useHistorialReportes } from '../../hooks/useHistorialReportes';
type Historial = ReturnType<typeof useHistorialReportes>;
export function FiltrosHistorial({ datos }: { datos: Historial }) {
  const { filters, opciones, updateFilters } = datos;
  return <div className="reporte-filtros">
    <label>Estado<select value={filters.estado || ''} onChange={e => updateFilters({ estado: e.target.value || undefined })}>
      <option value="">Todos los estados</option>{opciones.estados.map(valor => <option key={valor}>{valor}</option>)}</select></label>
    <label>Prioridad<select value={filters.prioridad || ''} onChange={e => updateFilters({ prioridad: e.target.value || undefined })}>
      <option value="">Todas las prioridades</option>{opciones.prioridades.map(valor => <option key={valor}>{valor}</option>)}</select></label>
    <label>Desde<input type="date" value={filters.fechaInicio || ''} max={filters.fechaFin}
      onChange={e => updateFilters({ fechaInicio: e.target.value || undefined })} /></label>
    <label>Hasta<input type="date" value={filters.fechaFin || ''} min={filters.fechaInicio}
      onChange={e => updateFilters({ fechaFin: e.target.value || undefined })} /></label>
    <button onClick={() => updateFilters({ estado: undefined, prioridad: undefined, fechaInicio: undefined, fechaFin: undefined })}>Limpiar filtros</button>
  </div>;
}
