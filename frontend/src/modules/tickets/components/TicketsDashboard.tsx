import { useTickets } from '../hooks/useTickets';
import { TicketForm } from './TicketForm';
import { FiltrosTickets } from './FiltrosTickets';
import { TablaTickets } from './TablaTickets';
import { PaginacionTickets } from './PaginacionTickets';
import '../styles/tickets.css';
export function TicketsDashboard() {
  const datos = useTickets();
  return <main className="tickets-pagina"><header className="tickets-cabecera"><div>
    <span className="tickets-etiqueta">Mi Red / Operaciones</span><h1>Gestión de Tickets e Incidentes</h1></div>
    <button disabled={datos.loading} onClick={datos.refresh}><span className={datos.loading ? 'tickets-spinner' : ''} aria-hidden="true">{!datos.loading && '↻'}</span>{datos.loading ? 'Actualizando…' : 'Refrescar'}</button>
  </header><TicketForm dispositivos={datos.dispositivos} onSubmit={datos.createTicket} />
    <FiltrosTickets datos={datos} />
    {datos.error ? <p className="tickets-error" role="alert">{datos.error}</p> : <>
      <TablaTickets tickets={datos.tickets} cargando={datos.loading} /><PaginacionTickets datos={datos} /></>}
  </main>;
}
