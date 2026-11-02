import { ControlVoz } from '../../hooks/useVoiceReport';
import { MicrofonoAnimado } from './MicrofonoAnimado';
import { TranscripcionVoz } from './TranscripcionVoz';
export function CapturaVoz({ voz }: { voz: ControlVoz }) {
  return <section className={`reporte-captura ${voz.status === 'listening' ? 'grabando' : ''}`}>
    <MicrofonoAnimado voz={voz} />
    <TranscripcionVoz voz={voz} />
    <form className="reporte-consulta" onSubmit={e => { e.preventDefault(); void voz.sendQuery(voz.typedQuery); }}>
      <label htmlFor="consulta-reporte">También puedes escribir tu consulta</label>
      <div><textarea id="consulta-reporte" value={voz.typedQuery} maxLength={1000} rows={3} placeholder="Escribe una pregunta sobre los incidentes…"
        disabled={voz.status === 'processing' || voz.status === 'listening'} onChange={e => voz.setTypedQuery(e.target.value)} />
        <button type="submit" disabled={!voz.typedQuery.trim() || voz.status === 'processing' || voz.status === 'listening'}>
          {voz.status === 'processing' ? 'Generando…' : 'Generar reporte'}</button></div>
    </form>
    {voz.status === 'processing' && <div role="status">Generando reporte… <button onClick={voz.cancelRequest}>Cancelar</button></div>}
    {voz.status === 'error' && <div className="reporte-error" role="alert">{voz.errorMessage}
      {voz.requestError && voz.lastQuery && <button onClick={() => { void voz.sendQuery(voz.lastQuery); }}>Reintentar</button>}</div>}
  </section>;
}
