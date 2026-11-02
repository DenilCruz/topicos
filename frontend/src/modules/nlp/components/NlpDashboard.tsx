import { useState } from 'react';
import { useNlp } from '../hooks/useNlp';
import { FormularioIncidente } from './FormularioIncidente';
import { EstadoAnalisis } from './EstadoAnalisis';
import { ResultadoDiagnostico } from './ResultadoDiagnostico';
import { PasosPreprocesamiento } from './PasosPreprocesamiento';
import { PanelMetricas } from './metricas/PanelMetricas';
import '../styles/nlp.css';

export function NlpDashboard() {
  const [texto, cambiarTexto] = useState('');
  const { analysis, loading, error, analyze, clear } = useNlp();
  return <main className="nlp-pagina">
    <header className="nlp-cabecera"><span className="nlp-etiqueta">Análisis de texto · Mi Red</span>
      <h1>Clasificación de incidentes de red</h1>
      <p>Describe un incidente para consultar su categoría y ver cómo se procesa el texto.</p></header>
    <FormularioIncidente texto={texto} cargando={loading}
      cambiarTexto={valor => { cambiarTexto(valor); clear(); }}
      analizar={() => { void analyze(texto); }} limpiar={() => { cambiarTexto(''); clear(); }} />
    <EstadoAnalisis cargando={loading} error={error} metodo={analysis?.preprocesamiento.metodo} />
    {analysis && <><ResultadoDiagnostico resultado={analysis} />
      <PasosPreprocesamiento pasos={analysis.preprocesamiento} /></>}
    <PanelMetricas />
  </main>;
}
