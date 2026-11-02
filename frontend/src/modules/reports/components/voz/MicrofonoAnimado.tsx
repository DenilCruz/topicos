import { ControlVoz } from '../../hooks/useVoiceReport';
import { MicIcon, StopIcon } from './IconosVoz';

export function MicrofonoAnimado({ voz }: { voz: ControlVoz }) {
  const escuchando = voz.status === 'listening';
  const procesando = voz.status === 'processing';
  return <div className={`voz-interaccion ${escuchando ? 'voz-escuchando' : ''} ${procesando ? 'voz-procesando' : ''}`}>
    {voz.recognition.supported && <div className="voz-microfono-marco">
      <span className="voz-anillo voz-anillo-uno" aria-hidden="true" />
      <span className="voz-anillo voz-anillo-dos" aria-hidden="true" />
      <button className="voz-microfono" onClick={voz.handleMicClick} disabled={procesando}
        aria-pressed={escuchando} aria-label={escuchando ? 'Detener y enviar consulta' : 'Iniciar consulta por voz'}>
        {escuchando ? <StopIcon /> : <MicIcon size={32} />}
      </button>
    </div>}
    {/* Indicador decorativo de escucha; no representa niveles de audio medidos. */}
    <div className="voz-ondas" aria-hidden="true">
      {Array.from({ length: 7 }, (_, indice) => <span key={indice} style={{ animationDelay: `${indice % 3 * 140}ms` }} />)}
    </div>
    <p className="voz-estado" role="status"><span className="voz-punto" aria-hidden="true" />{voz.statusLabel[voz.status]}</p>
  </div>;
}
