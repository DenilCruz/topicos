import { useTickets } from '../hooks/useTickets';
export function PaginacionTickets({ datos }: { datos: ReturnType<typeof useTickets> }) {
  const pagina = datos.filters.page || 1;
  return <footer className="tickets-paginacion"><span>{datos.totalElements} tickets en el resultado filtrado</span><div>
    <button disabled={datos.loading || pagina <= 1} onClick={() => datos.goToPage(pagina - 1)}>Anterior</button>
    <span>Página {datos.totalPages ? pagina : 0} de {datos.totalPages}</span>
    <button disabled={datos.loading || pagina >= datos.totalPages} onClick={() => datos.goToPage(pagina + 1)}>Siguiente</button>
  </div></footer>;
}
