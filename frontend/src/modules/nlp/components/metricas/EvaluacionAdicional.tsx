import { Acordeon } from '../Acordeon';
import { ComparacionModelos } from '../../types/nlp.types';
import { porcentaje } from '../../utils/formato';
import { TablaMetricas } from './TablaMetricas';
import { MatrizConfusion } from './MatrizConfusion';

export function EvaluacionAdicional({ revision }: { revision: ComparacionModelos['revision_adicional'] }) {
  return <section className="nlp-evaluacion-adicional">
    <h3>Evaluación adicional · descripciones nuevas</h3>
    {revision ? <>
      <p><strong className="nlp-numero">{porcentaje(revision.accuracy)}</strong> de accuracy ·
        {' '}{revision.casos.filter(caso => caso.acierto).length} aciertos de {revision.casos.length} casos.</p>
      <p>{revision.origen}</p>
      <p>Solo se evaluó el pipeline ganador, sin reentrenarlo. Es una muestra distinta y pequeña:
        no indica que el modelo haya empeorado ni estima su rendimiento en una red real.</p>
      <Acordeon titulo="Ver métricas y matriz de los casos adicionales">
        <TablaMetricas evaluacion={revision} /><MatrizConfusion evaluacion={revision} />
      </Acordeon>
    </> : <p>No hay evaluación adicional disponible para el pipeline actual.</p>}
  </section>;
}
