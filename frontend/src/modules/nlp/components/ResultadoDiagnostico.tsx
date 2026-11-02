import { NlpAnalysisResponse } from '../types/nlp.types';
import { nombreCategoria, porcentaje } from '../utils/formato';

export function ResultadoDiagnostico({ resultado }: { resultado: NlpAnalysisResponse }) {
  return <section className="nlp-resultado" aria-labelledby="resultado-nlp" aria-live="polite">
    <header className="nlp-fila"><h2 id="resultado-nlp"><span className="nlp-punto" /> Diagnóstico sugerido</h2>
      <span className="nlp-insignia">Análisis completado</span></header>
    <div className="nlp-resultado-datos">
      <div><span className="nlp-etiqueta">Categoría predicha</span>
        <p className="nlp-categoria">{nombreCategoria(resultado.categoria_predecida)}</p></div>
      <div><span className="nlp-etiqueta">Probabilidad del modelo</span>
        <p className="nlp-numero">{porcentaje(resultado.probabilidad)}</p></div>
      <div><span className="nlp-etiqueta">Tiempo de inferencia</span>
        <p className="nlp-numero">{resultado.tiempo_inferencia_ms} ms</p></div>
    </div>
    <footer>La categoría es una sugerencia para revisión técnica. Esta consulta no modifica tickets.</footer>
  </section>;
}
