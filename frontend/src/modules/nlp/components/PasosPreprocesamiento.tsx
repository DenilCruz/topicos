import { PasosNlp } from '../types/nlp.types';

export function PasosPreprocesamiento({ pasos }: { pasos: PasosNlp }) {
  const etapas = [
    ['1. Normalización', pasos.texto_normalizado],
    ['2. Tokenización', pasos.tokens.join(' · ')],
    ['3. Stop words eliminadas', pasos.palabras_eliminadas.join(' · ') || 'Ninguna'],
    ['Tokens sin stop words', pasos.tokens_sin_palabras_vacias.join(' · ') || 'Ninguno'],
    [pasos.metodo === 'stemming' ? '4. Stemming: raíces' : '4. Lematización: lemas', pasos.tokens_procesados.join(' · ') || 'Ninguno'],
    [`5. N-gramas (rango ${pasos.rango_ngramas.join(' a ')})`, pasos.ngramas.join(' · ') || 'Ninguno'],
  ];
  return <section aria-labelledby="pasos-nlp">
    <h2 id="pasos-nlp">Preprocesamiento paso a paso</h2>
    {etapas.map(([titulo, contenido]) => <div key={titulo} style={{ marginBottom: '1rem', overflowWrap: 'anywhere' }}>
      <h3>{titulo}</h3><p>{contenido || 'El texto quedó vacío.'}</p>
    </div>)}
    <h3>6. TF-IDF</h3>
    <p>Hasta 30 términos con mayor peso dentro del vocabulario aprendido.</p>
    {pasos.caracteristicas_tfidf.length ? <table>
      <thead><tr><th scope="col">Término</th><th scope="col">Peso</th></tr></thead>
      <tbody>{pasos.caracteristicas_tfidf.map(({ termino, peso }) => <tr key={termino}>
        <td>{termino}</td><td>{peso.toFixed(4)}</td>
      </tr>)}</tbody>
    </table> : <p>No hay términos del texto en el vocabulario del modelo. La predicción puede ser poco informativa.</p>}
  </section>;
}
