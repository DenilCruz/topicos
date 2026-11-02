import { EvaluacionModelo, MetricasCategoria } from '../../types/nlp.types';
import { nombreCategoria, porcentaje } from '../../utils/formato';
export function TablaMetricas({ evaluacion }: { evaluacion: EvaluacionModelo }) {
 return (
    <div className="metricas-tabla">
      <table><caption>Resultados por categoría</caption>
        <thead><tr><th>Categoría</th><th>Precision</th><th>Recall</th><th>F1</th><th>Casos</th></tr></thead>
        <tbody>{evaluacion.categorias.map(categoria => {
          const valores = evaluacion.reporte[categoria] as MetricasCategoria;
          return <tr key={categoria}><th scope="row">{nombreCategoria(categoria)}</th>
            <td>{porcentaje(valores.precision)}</td><td>{porcentaje(valores.recall)}</td>
            <td>{porcentaje(valores['f1-score'])}</td><td>{valores.support}</td></tr>;
        })}</tbody>
      </table>
    </div>
 );
}
