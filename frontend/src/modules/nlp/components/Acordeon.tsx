import { ReactNode, useId, useState } from 'react';
import '../styles/acordeon.css';

export function Acordeon({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [abierto, cambiarAbierto] = useState(false);
  const identificador = useId();
  return <div className={`nlp-acordeon ${abierto ? 'nlp-acordeon-abierto' : ''}`}>
    <button type="button" className="nlp-acordeon-boton" id={`${identificador}-boton`}
      aria-expanded={abierto} aria-controls={`${identificador}-contenido`}
      onClick={() => cambiarAbierto(valor => !valor)}>
      <svg className="nlp-acordeon-flecha" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {titulo}
    </button>
    <div className="nlp-acordeon-panel" id={`${identificador}-contenido`}
      aria-labelledby={`${identificador}-boton`} aria-hidden={!abierto}>
      <div className="nlp-acordeon-recorte"><div className="nlp-acordeon-interior">{children}</div></div>
    </div>
  </div>;
}
