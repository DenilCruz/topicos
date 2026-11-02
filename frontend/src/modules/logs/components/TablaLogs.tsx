import { AuditLogItem } from '../types/logs.types';
import { fechaLog, duracionLog } from '../utils/formato';

export function TablaLogs({ registros, seleccionado, seleccionar }: {
  registros: AuditLogItem[]; seleccionado?: number; seleccionar: (registro: AuditLogItem) => void;
}) {
  return <div className="logs-tabla"><table><caption>Registros HTTP · horario de Bolivia</caption>
    <thead><tr>{['Fecha/hora', 'Severidad', 'Método', 'Ruta', 'Estado', 'Duración', 'Usuario', 'IP', 'Detalle'].map(titulo => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
    <tbody>{registros.map((registro, indice) => <tr key={registro.id}
      className={seleccionado === registro.id ? 'logs-seleccionado' : ''} style={{ animationDelay: `${Math.min(indice, 10) * 25}ms` }}>
      <td>{fechaLog(registro.timestamp)}</td><td><span className={`logs-insignia logs-${registro.severity.toLowerCase()}`}>{registro.severity}</span></td>
      <td><code>{registro.method}</code></td><td className="logs-ruta"><code>{registro.path}</code></td>
      <td>{registro.status_code}</td><td>{duracionLog(registro.duration_ms)}</td>
      <td>{registro.user_identifier || 'Sin usuario'}</td><td><code>{registro.ip_address || 'Sin IP'}</code></td>
      <td><button onClick={() => seleccionar(registro)} aria-expanded={seleccionado === registro.id}>Ver detalle</button></td>
    </tr>)}</tbody>
  </table>{!registros.length && <p className="logs-vacio">No se encontraron registros con esos filtros.</p>}</div>;
}
