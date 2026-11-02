import { FormEvent, useState } from 'react';
import { LogFilterParams, RespuestaLogs } from '../types/logs.types';

interface Propiedades {
  filtros: LogFilterParams; opciones?: RespuestaLogs['opciones']; cargando: boolean;
  aplicar: (filtros: Partial<LogFilterParams>) => void;
}
export function FiltrosLogs({ filtros, opciones, cargando, aplicar }: Propiedades) {
  const [busqueda, cambiarBusqueda] = useState('');
  const [usuario, cambiarUsuario] = useState('');
  function enviar(evento: FormEvent) { evento.preventDefault(); aplicar({ search: busqueda || undefined, user: usuario || undefined }); }
  return <form className="logs-filtros" onSubmit={enviar}>
    <label>Severidad<select value={filtros.severity || ''} disabled={cargando}
      onChange={e => aplicar({ severity: e.target.value || undefined })}>
      <option value="">Todas</option>{opciones?.severidades.map(valor => <option key={valor}>{valor}</option>)}
    </select></label>
    <label>Método<select value={filtros.method || ''} disabled={cargando}
      onChange={e => aplicar({ method: e.target.value || undefined })}>
      <option value="">Todos</option>{opciones?.metodos.map(valor => <option key={valor}>{valor}</option>)}
    </select></label>
    <label>Usuario exacto<input value={usuario} onChange={e => cambiarUsuario(e.target.value)} placeholder="Nombre de usuario" /></label>
    <label className="logs-busqueda">Buscar<input value={busqueda} onChange={e => cambiarBusqueda(e.target.value)} placeholder="Ruta, IP, usuario o mensaje…" /></label>
    <button disabled={cargando}>Aplicar filtros</button>
    <button type="button" disabled={cargando} onClick={() => {
      cambiarBusqueda(''); cambiarUsuario(''); aplicar({ search: undefined, user: undefined, severity: undefined, method: undefined });
    }}>Limpiar</button>
  </form>;
}
