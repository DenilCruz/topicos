import { ControlVoz } from '../../hooks/useVoiceReport';

export function TranscripcionVoz({ voz }: { voz: ControlVoz }) {
  const escuchando = voz.status === 'listening';
  const texto = escuchando ? voz.recognition.finalText : voz.transcript;
  return <div className="voz-transcripcion">
    <div className="voz-transcripcion-titulo"><span id="titulo-transcripcion">Transcripción</span>
      {!escuchando && voz.recognition.finalText && <span className="voz-transcrito">✓ Transcrito</span>}</div>
    <div className={`voz-transcripcion-caja ${escuchando ? 'voz-transcribiendo' : ''}`}
      aria-labelledby="titulo-transcripcion" role="log" aria-live="polite">
      {texto || voz.recognition.interimText ? <>{texto} <em>{voz.recognition.interimText}</em></> :
        <span className="voz-placeholder">La transcripción aparecerá aquí al hablar.</span>}
      {escuchando && <span className="voz-cursor" aria-hidden="true">|</span>}
    </div>
  </div>;
}
