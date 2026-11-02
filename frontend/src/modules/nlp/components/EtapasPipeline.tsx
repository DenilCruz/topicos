interface Propiedades {
  completado: boolean;
  metodo?: string;
}

export function EtapasPipeline({ completado, metodo }: Propiedades) {
  const [etapasIluminadas, cambiarEtapasIluminadas] = useState(0);
  useEffect(() => {
    cambiarEtapasIluminadas(0);
    if (!completado) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cambiarEtapasIluminadas(6);
      return;
    }
    // La API ya terminó: esta secuencia solo presenta los resultados recibidos.
    const temporizadores = Array.from({ length: 6 }, (_, indice) =>
      window.setTimeout(() => cambiarEtapasIluminadas(indice + 1), (indice + 1) * 400));
    return () => temporizadores.forEach(window.clearTimeout);
  }, [completado, metodo]);
  const etapas = [
    'Normalización', 'Tokenización', 'Stop words',
    metodo === 'stemming' ? 'Stemming' : metodo === 'lematizacion' ? 'Lematización' : 'Stemming / lematización',
    'N-gramas', 'TF-IDF',
  ];
  return <ol className="nlp-etapas" aria-label="Etapas del pipeline">
    {etapas.map((etapa, indice) => <li key={etapa}
      className={`nlp-etapa ${completado && indice < etapasIluminadas ? 'nlp-etapa-completada' : ''}`}>
      <span className="nlp-etapa-icono" aria-hidden="true">{completado && indice < etapasIluminadas ? '✓' : indice + 1}</span>
      <div><h3>{etapa}</h3><p>{completado ? (indice < etapasIluminadas ? 'Completado' : 'Resultado recibido') : 'Esperando resultado'}</p></div>
    </li>)}
  </ol>;
}
import { useEffect, useState } from 'react';
