import { Ticket } from '../types/tickets.types';
export function TablaTickets({ tickets, cargando }: { tickets: Ticket[]; cargando: boolean }) {
  return <div className="tickets-tabla" aria-busy={cargando}><table><caption>Historial de incidentes · horario de Bolivia</caption>
    <thead><tr>{['ID', 'Fecha/hora', 'Título', 'Dispositivo', 'Estado', 'Categoría (ML)', 'Prioridad', 'Usuario'].map(t => <th scope="col" key={t}>{t}</th>)}</tr></thead>
    <tbody>{!cargando && tickets.map((t, indice) => <tr key={t.id} style={{ animationDelay: `${Math.min(indice, 8) * 35}ms` }}>
      <td className="tickets-id">#{t.id}</td><td>{new Date(t.fechaCreacion).toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}</td>
      <td><details><summary>{t.titulo}</summary><p>{t.descripcion}</p></details></td><td>{t.dispositivoNombre || 'Sin dispositivo'}</td>
      <td><span className={`tickets-estado ${t.estado === 'RESUELTO' ? 'resuelto' : t.estado === 'PENDIENTE_DIAGNOSTICO' ? 'pendiente' : ''}`}>{t.estado.replace(/_/g, ' ')}</span></td>
      <td className="tickets-categoria">{t.categoria || 'Sin diagnóstico'}{t.categoria && t.probabilidad !== null && <small>{(t.probabilidad * 100).toFixed(1)} %</small>}</td>
      <td><span className={`tickets-prioridad prioridad-${t.prioridad?.toLowerCase() || 'sin'}`}>{t.prioridad || 'Sin asignar'}</span></td><td>{t.usuarioNombre || 'Sin usuario'}</td>
    </tr>)}</tbody></table>
    {cargando ? <p className="tickets-vacio" role="status">Cargando tickets…</p> : !tickets.length && <p className="tickets-vacio">No se encontraron tickets para estos filtros.</p>}
  </div>;
}
