import { NlpAnalysisResponse } from '../types/nlp.types';

export function ResultadoDiagnostico({ resultado }: { resultado: NlpAnalysisResponse }) {
  return <section aria-labelledby="resultado-nlp">
    <h2 id="resultado-nlp">Diagnóstico sugerido</h2>
    <p><strong>Categoría:</strong> {resultado.categoria_predecida}</p>
    <p><strong>Probabilidad del modelo:</strong> {(resultado.probabilidad * 100).toFixed(1)} %</p>
    <p><strong>Tiempo de inferencia:</strong> {resultado.tiempo_inferencia_ms} ms</p>
    <p>Esta consulta no guarda ni modifica un ticket.</p>
  </section>;
}
