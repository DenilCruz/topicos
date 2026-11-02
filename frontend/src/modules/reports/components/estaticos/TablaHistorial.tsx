import { Ticket } from '@/modules/tickets/types/tickets.types';
export function TablaHistorial({ tickets, loading }: { tickets: Ticket[]; loading: boolean }) {
  return <div className="reporte-tabla" aria-busy={loading}><table><caption>Incidentes registrados · horario de Bolivia</caption>
    <thead><tr>{['ID', 'Fecha/hora', 'Título', 'Dispositivo', 'Estado', 'Categoría (ML)', 'Prioridad', 'Usuario'].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead>
    <tbody>{tickets.map(t => <tr key={t.id}>
      <td>#{t.id}</td><td>{new Date(t.fechaCreacion).toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}</td>
      <td><details><summary>{t.titulo}</summary><p>{t.descripcion}</p></details></td>
      <td>{t.dispositivoNombre || 'Sin dispositivo'}</td><td><span className="reporte-badge">{t.estado}</span></td>
      <td>{t.categoria || 'Sin diagnóstico'}{t.categoria && t.probabilidad !== null && ` (${(t.probabilidad * 100).toFixed(1)} %)`}</td>
      <td>{t.prioridad || 'Sin prioridad'}</td><td>{t.usuarioNombre || 'Sin usuario'}</td>
    </tr>)}</tbody>
  </table>{loading ? <p role="status" className="reporte-vacio">Consultando historial…</p> : !tickets.length && <p className="reporte-vacio">No hay incidentes para estos filtros.</p>}</div>;
}
