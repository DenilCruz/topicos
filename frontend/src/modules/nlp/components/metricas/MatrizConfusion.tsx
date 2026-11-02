import { EvaluacionModelo } from '../../types/nlp.types';
import { nombreCategoria } from '../../utils/formato';
export function MatrizConfusion({ evaluacion }: { evaluacion: EvaluacionModelo }) {
 return <>
    <div className="metricas-tabla">
      <table><caption>Matriz de confusión · filas: categoría real; columnas: predicción</caption>
        <thead><tr><th>Real ↓ / Predicción →</th>{evaluacion.categorias.map(categoria => <th key={categoria}>{nombreCategoria(categoria)}</th>)}</tr></thead>
        <tbody>{evaluacion.matriz_confusion.map((fila, i) => <tr key={evaluacion.categorias[i]}>
          <th scope="row">{nombreCategoria(evaluacion.categorias[i])}</th>
          {fila.map((valor, j) => <td key={j} className={i === j ? 'metricas-acierto' : valor ? 'metricas-confusion' : ''}>{valor}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
<p>La diagonal muestra aciertos; los demás valores indican confusiones.</p></>;
}
