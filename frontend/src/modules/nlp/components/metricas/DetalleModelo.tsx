import { Acordeon } from '../Acordeon';
import { ComparacionModelos } from '../../types/nlp.types';
import { nombreModelo } from '../../utils/formato';
import { TablaMetricas } from './TablaMetricas';
import { MatrizConfusion } from './MatrizConfusion';

export function DetalleModelo({ nombre, resultado }: {
  nombre: string; resultado: ComparacionModelos['modelos'][string];
}) {
  return <Acordeon titulo={`${nombreModelo(nombre)}: categorías, matriz y configuración`}>
    <TablaMetricas evaluacion={resultado.prueba} />
    <MatrizConfusion evaluacion={resultado.prueba} />
    <h4>Configuración seleccionada</h4>
    <ul>{Object.entries(resultado.mejores_parametros).map(([clave, valor]) =>
      <li key={clave}>{clave}: {JSON.stringify(valor)}</li>)}</ul>
  </Acordeon>;
}
