import { ComparacionModelos as DatosComparacion } from '../../types/nlp.types';
import { nombreModelo, porcentaje, promedio } from '../../utils/formato';
export function ComparacionModelos({ datos }: { datos: DatosComparacion }) {
 return (
      <div className="metricas-tabla"><table><caption>Comparación de clasificadores</caption>
        <thead><tr><th>Modelo</th><th>F1 macro validación</th><th>Accuracy prueba</th><th>Precision macro</th><th>Recall macro</th><th>F1 macro prueba</th></tr></thead>
        <tbody>{Object.entries(datos.modelos).map(([nombre, resultado]) => {
          const macro = promedio(resultado.prueba);
          return <tr key={nombre}><th scope="row">{nombreModelo(nombre)}</th>
            <td>{porcentaje(resultado.f1_macro_validacion)}</td><td>{porcentaje(resultado.prueba.accuracy)}</td>
            <td>{porcentaje(macro.precision)}</td><td>{porcentaje(macro.recall)}</td><td>{porcentaje(macro['f1-score'])}</td></tr>;
        })}</tbody>
      </table></div>
 );
}
