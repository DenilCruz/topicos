import { ControlVoz } from '../../hooks/useVoiceReport';
export function ResultadoVoz({ voz }: { voz: ControlVoz }) {
  if (!voz.result) return null;
  return <section className="reporte-respuesta"><header><div><span className="reporte-etiqueta">Respuesta del servicio de IA</span>
    <h3>{voz.result.title}</h3>{voz.result.query && <p>Consulta: {voz.result.query}</p>}</div>
    <div className="reporte-acciones">{voz.speech.status === 'idle' ?
      <button disabled={!voz.speech.supported} onClick={() => voz.speech.speak(voz.plainText)}>Reproducir respuesta</button> : <>
      {voz.speech.status === 'speaking' ? <button onClick={voz.speech.pause}>Pausar</button> : <button onClick={voz.speech.resume}>Continuar</button>}
      <button onClick={voz.speech.stop}>Detener</button></>}</div></header>
    <article>{voz.rendered}</article></section>;
}
