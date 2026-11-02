import { useVoiceReport } from '../hooks/useVoiceReport';
import { CabeceraReporte } from './comunes/CabeceraReporte';
import { CapturaVoz } from './voz/CapturaVoz';
import { ResultadoVoz } from './voz/ResultadoVoz';
import '../styles/voz.css';
export function VoiceReport() {
  const voz = useVoiceReport();
  const ocupado = voz.status === 'processing' || voz.status === 'listening';
  return <div className="reporte-vista voz-panel"><CabeceraReporte titulo="Análisis por voz (IA)" descripcion="Pregunta en voz alta sobre los incidentes de red; el proveedor seleccionado responde usando las métricas del sistema.">
    <button disabled={ocupado} onClick={voz.loadWeeklySummary}>Resumen semanal</button>
  </CabeceraReporte><label className="reporte-proveedor">Proveedor de IA
    <select value={voz.proveedor} disabled={ocupado} onChange={e => { voz.cambiarProveedor(e.target.value as 'groq' | 'deepseek'); voz.setResult(null); }}>
      <option value="groq">Groq</option><option value="deepseek">DeepSeek</option></select></label>
    <CapturaVoz voz={voz} /><ResultadoVoz voz={voz} />
  </div>;
}
