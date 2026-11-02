import { useState, FormEvent } from 'react';
import { CreateTicketPayload, Dispositivo } from '../types/tickets.types';
interface Propiedades { dispositivos: Dispositivo[]; onSubmit: (datos: CreateTicketPayload) => Promise<string | null>; }
export function TicketForm({ dispositivos, onSubmit }: Propiedades) {
  const [titulo, cambiarTitulo] = useState('');
  const [descripcion, cambiarDescripcion] = useState('');
  const [dispositivo, cambiarDispositivo] = useState('');
  const [enviando, cambiarEnvio] = useState(false);
  const [error, cambiarError] = useState('');
  const [mensaje, cambiarMensaje] = useState('');
  const longitud = descripcion.trim().length;
  async function enviar(evento: FormEvent) {
    evento.preventDefault(); cambiarError(''); cambiarMensaje('');
    if (longitud < 10 || longitud > 2000 || !titulo.trim() || !dispositivo) {
      cambiarError('Completa el título, selecciona un dispositivo y escribe una descripción de 10 a 2000 caracteres.'); return;
    }
    cambiarEnvio(true);
    try {
      const fallo = await onSubmit({ titulo: titulo.trim(), descripcion: descripcion.trim(), dispositivoId: Number(dispositivo) });
      if (fallo) cambiarError(fallo);
      else { cambiarTitulo(''); cambiarDescripcion(''); cambiarDispositivo(''); cambiarMensaje('Ticket registrado. Ya puedes consultarlo en el historial.'); }
    } catch { cambiarError('No se pudo registrar el ticket. Intenta nuevamente.'); }
    finally { cambiarEnvio(false); }
  }
  return <section className="tickets-formulario"><header><span className="tickets-etiqueta">Nuevo reporte</span><h2>Reportar incidente</h2></header>
    <form onSubmit={enviar}><fieldset disabled={enviando}>
      <div className="tickets-campos"><label>Título<input required maxLength={255} placeholder="Título del incidente" value={titulo} onChange={e => cambiarTitulo(e.target.value)} /></label>
        <label>Dispositivo<select required value={dispositivo} onChange={e => cambiarDispositivo(e.target.value)}>
          <option value="">Selecciona un dispositivo</option>{dispositivos.map(d => <option key={d.id} value={d.id}>{d.nombre}{d.ubicacion ? ` — ${d.ubicacion}` : ''}</option>)}</select></label></div>
      {!dispositivos.length && <p className="tickets-nota">No hay dispositivos disponibles. Comprueba el catálogo o actualiza la página.</p>}
      <label>Descripción<textarea rows={4} required minLength={10} maxLength={2000} value={descripcion}
        onChange={e => cambiarDescripcion(e.target.value)} placeholder="Describe los síntomas de la falla en lenguaje natural…" /></label>
      <div className="tickets-fila"><span className="tickets-contador">{longitud} / 2000 caracteres (mínimo 10)</span>
        <button type="submit" className="tickets-primario" disabled={!dispositivos.length}>{enviando && <span className="tickets-spinner" aria-hidden="true" />}{enviando ? 'Registrando…' : 'Registrar ticket'}</button></div>
    </fieldset></form>
    {error && <p className="tickets-error" role="alert">{error}</p>}{mensaje && <p className="tickets-exito" role="status">{mensaje}</p>}
  </section>;
}
