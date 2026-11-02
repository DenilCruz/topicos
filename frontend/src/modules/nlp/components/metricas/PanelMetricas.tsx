import { Acordeon } from '../Acordeon';
import { useMetricas } from '../../hooks/useMetricas';
import { nombreModelo } from '../../utils/formato';
import { ComparacionModelos } from './ComparacionModelos';
import { DetalleModelo } from './DetalleModelo';
import { EvaluacionAdicional } from './EvaluacionAdicional';
import '../../styles/metricas.css';

export function PanelMetricas() {
  const { datos, cargando, error, reintentar } = useMetricas();
  return <section className="panel-metricas" aria-labelledby="titulo-metricas">
    <div><span className="nlp-etiqueta">Validación y resultados</span>
      <h2 id="titulo-metricas">Evaluación de los modelos</h2>
      <p>Resultados guardados del entrenamiento. Consultarlos no vuelve a entrenar el modelo.</p></div>
    {cargando ? <p role="status">Cargando métricas…</p> : error ? <div role="alert" className="nlp-error">
      <p>{error}</p><button className="nlp-boton" onClick={reintentar}>Reintentar</button>
    </div> : datos && <>
      <p className="metricas-aviso">{datos.advertencia}</p>
      <p><strong>Modelo seleccionado:</strong> {nombreModelo(datos.modelo_elegido)}. {datos.criterio}.</p>
      <h3>Test de plantillas · {datos.cantidad_prueba} textos</h3>
      <p>Entrenamiento: {datos.cantidad_entrenamiento} textos.</p>
      <ComparacionModelos datos={datos} />
      {Object.entries(datos.modelos).map(([nombre, resultado]) =>
        <DetalleModelo key={nombre} nombre={nombre} resultado={resultado} />)}
      <EvaluacionAdicional revision={datos.revision_adicional} />
      <Acordeon titulo="¿Cómo interpretar las métricas?">
        <p>Accuracy: proporción total de aciertos. Precision: de los casos asignados a una categoría,
          cuántos eran correctos. Recall: de los casos reales de esa categoría, cuántos encontró.
          F1 combina precision y recall. El promedio macro da la misma importancia a cada categoría.</p>
      </Acordeon>
    </>}
  </section>;
}
