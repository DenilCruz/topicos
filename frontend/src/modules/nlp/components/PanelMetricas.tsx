import { useEffect, useState } from 'react';
import axios from 'axios';
import { nlpApi } from '../services/nlpApi';
import { ComparacionModelos, EvaluacionModelo, MetricasCategoria } from '../types/nlp.types';
import './PanelMetricas.css';

const porcentaje = (valor: number) => `${(valor * 100).toLocaleString('es', { maximumFractionDigits: 1 })} %`;
const nombreModelo = (nombre: string) => ({ regresion_logistica: 'Regresión logística', naive_bayes: 'Naive Bayes' }[nombre] || nombre);
const nombreCategoria = (nombre: string) => nombre.replace(/_/g, ' ');
function promedio(evaluacion: EvaluacionModelo): MetricasCategoria {
  return evaluacion.reporte['macro avg'] as MetricasCategoria;
}

function DetalleEvaluacion({ evaluacion }: { evaluacion: EvaluacionModelo }) {
  return <>
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
    <div className="metricas-tabla">
      <table><caption>Matriz de confusión · filas: categoría real; columnas: predicción</caption>
        <thead><tr><th>Real ↓ / Predicción →</th>{evaluacion.categorias.map(categoria => <th key={categoria}>{nombreCategoria(categoria)}</th>)}</tr></thead>
        <tbody>{evaluacion.matriz_confusion.map((fila, i) => <tr key={evaluacion.categorias[i]}>
          <th scope="row">{nombreCategoria(evaluacion.categorias[i])}</th>
          {fila.map((valor, j) => <td key={j} className={i === j ? 'metricas-acierto' : valor ? 'metricas-confusion' : ''}>{valor}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <p>La diagonal muestra aciertos; los demás valores indican categorías confundidas.</p>
  </>;
}

export function PanelMetricas() {
  const [datos, cambiarDatos] = useState<ComparacionModelos | null>(null);
  const [cargando, cambiarCarga] = useState(true);
  const [error, cambiarError] = useState('');
  const [intento, cambiarIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    cambiarCarga(true);
    cambiarError('');
    nlpApi.consultarMetricas().then(resultado => {
      if (vigente) cambiarDatos(resultado);
    }).catch((fallo: unknown) => {
      if (!vigente) return;
      const detalle = axios.isAxiosError(fallo) ? fallo.response?.data?.error : null;
      cambiarError(detalle?.message || detalle?.details?.detail || 'No se pudieron cargar las métricas. Comprueba tu sesión y la conexión.');
    }).finally(() => { if (vigente) cambiarCarga(false); });
    return () => { vigente = false; };
  }, [intento]);

  return <section className="panel-metricas" aria-labelledby="titulo-metricas">
    <h2 id="titulo-metricas">Evaluación de los modelos</h2>
    <p>Resultados guardados del entrenamiento. Consultarlos no vuelve a entrenar el modelo.</p>
    {cargando ? <p role="status">Cargando métricas…</p> : error ? <div role="alert">
      <p>{error}</p><button onClick={() => cambiarIntento(intento + 1)}>Reintentar</button>
    </div> : datos && <>
      <p className="metricas-aviso">{datos.advertencia}</p>
      <p><strong>Modelo seleccionado:</strong> {nombreModelo(datos.modelo_elegido)}. {datos.criterio}.
        Un empate conserva el primer modelo; no demuestra superioridad.</p>
      <h3>Test de plantillas · {datos.cantidad_prueba} textos</h3>
      <p>Entrenamiento: {datos.cantidad_entrenamiento} textos. Las variantes de las mismas plantillas aparecen en entrenamiento y prueba.</p>
      <div className="metricas-tabla"><table><caption>Comparación de clasificadores</caption>
        <thead><tr><th>Modelo</th><th>F1 macro validación</th><th>Accuracy prueba</th><th>Precision macro</th><th>Recall macro</th><th>F1 macro prueba</th></tr></thead>
        <tbody>{Object.entries(datos.modelos).map(([nombre, resultado]) => {
          const macro = promedio(resultado.prueba);
          return <tr key={nombre}><th scope="row">{nombreModelo(nombre)}</th>
            <td>{porcentaje(resultado.f1_macro_validacion)}</td><td>{porcentaje(resultado.prueba.accuracy)}</td>
            <td>{porcentaje(macro.precision)}</td><td>{porcentaje(macro.recall)}</td><td>{porcentaje(macro['f1-score'])}</td></tr>;
        })}</tbody>
      </table></div>
      {Object.entries(datos.modelos).map(([nombre, resultado]) => <details key={nombre}>
        <summary>{nombreModelo(nombre)}: categorías, matriz y configuración</summary>
        <DetalleEvaluacion evaluacion={resultado.prueba} />
        <h4>Configuración seleccionada</h4>
        <ul>{Object.entries(resultado.mejores_parametros).map(([clave, valor]) => <li key={clave}>{clave}: {JSON.stringify(valor)}</li>)}</ul>
      </details>)}
      <h3>Evaluación adicional · descripciones nuevas</h3>
      {datos.revision_adicional ? <>
        <p><strong>{porcentaje(datos.revision_adicional.accuracy)} de accuracy</strong> · {datos.revision_adicional.casos.filter(caso => caso.acierto).length} aciertos de {datos.revision_adicional.casos.length} casos.
          Solo se evaluó el pipeline ganador, sin reentrenarlo.</p>
        <p>{datos.revision_adicional.origen}</p>
        <p>Es una muestra distinta y pequeña: no indica que el modelo haya empeorado ni estima su rendimiento en una red real.</p>
        <details><summary>Ver métricas y matriz de los casos adicionales</summary><DetalleEvaluacion evaluacion={datos.revision_adicional} /></details>
      </> : <p>No hay evaluación adicional disponible para el pipeline actual.</p>}
      <details><summary>¿Cómo interpretar las métricas?</summary>
        <p>Accuracy: proporción total de aciertos. Precision: de los casos asignados a una categoría, cuántos eran correctos.
          Recall: de los casos reales de esa categoría, cuántos encontró. F1 combina precision y recall.
          El promedio macro da la misma importancia a cada categoría.</p>
      </details>
    </>}
  </section>;
}
