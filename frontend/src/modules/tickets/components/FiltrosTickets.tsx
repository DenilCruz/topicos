import { useTickets } from '../hooks/useTickets';
export function FiltrosTickets({ datos }: { datos: ReturnType<typeof useTickets> }) {
  const { filters, updateFilters, opciones } = datos;
  return <section className="tickets-filtros" aria-label="Filtros del historial">
    <label>Categoría<input placeholder="Categoría…" value={filters.categoria || ''} onChange={e => updateFilters({ categoria: e.target.value || undefined })} /></label>
    <label>Prioridad<select value={filters.prioridad || ''} onChange={e => updateFilters({ prioridad: e.target.value || undefined })}>
      <option value="">Todas las prioridades</option>{opciones.prioridades.map(v => <option key={v}>{v}</option>)}</select></label>
    <label>Estado<select value={filters.estado || ''} onChange={e => updateFilters({ estado: e.target.value || undefined })}>
      <option value="">Todos los estados</option>{opciones.estados.map(v => <option key={v}>{v}</option>)}</select></label>
    <label>Desde<input type="date" max={filters.fechaFin} value={filters.fechaInicio || ''} onChange={e => updateFilters({ fechaInicio: e.target.value || undefined })} /></label>
    <label>Hasta<input type="date" min={filters.fechaInicio} value={filters.fechaFin || ''} onChange={e => updateFilters({ fechaFin: e.target.value || undefined })} /></label>
    <button onClick={() => updateFilters({ categoria: undefined, prioridad: undefined, estado: undefined, fechaInicio: undefined, fechaFin: undefined })}>Limpiar</button>
  </section>;
}
