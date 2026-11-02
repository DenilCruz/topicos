import { EtapasPipeline } from './EtapasPipeline';

interface Propiedades {
  cargando: boolean;
  error: string | null;
  metodo?: string;
}

export function EstadoAnalisis({ cargando, error, metodo }: Propiedades) {
  if (error) return <div className="nlp-error" role="alert"><strong>No se pudo completar el análisis</strong><p>{error}</p></div>;
  if (!cargando && !metodo) return null;
  return <section className="nlp-progreso" role="status" aria-live="polite">
    <div className="nlp-fila">{cargando && <span className="nlp-spinner" aria-hidden="true" />}
      <strong>{cargando ? 'Procesando la descripción con el pipeline activo' : 'Procesamiento completado'}</strong></div>
    {cargando && <><div className="nlp-progreso-barra" aria-hidden="true"><span /></div>
      <p>Las etapas se ejecutan en el backend. Su resultado se confirma al finalizar la consulta.</p></>}
    <EtapasPipeline completado={!cargando} metodo={metodo} />
  </section>;
}
