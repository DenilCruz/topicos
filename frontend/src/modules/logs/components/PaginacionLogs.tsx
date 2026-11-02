import { RespuestaLogs } from '../types/logs.types';

export function PaginacionLogs({ datos, cargando, cambiar }: {
  datos: RespuestaLogs; cargando: boolean; cambiar: (pagina: number) => void;
}) {
  return <footer className="logs-paginacion"><span>{datos.count} registros · Página {datos.current_page} de {datos.total_pages}</span>
    <div><button disabled={cargando || !datos.previous} onClick={() => cambiar(datos.current_page - 1)}>Anterior</button>
      <button disabled={cargando || !datos.next} onClick={() => cambiar(datos.current_page + 1)}>Siguiente</button></div>
  </footer>;
}
