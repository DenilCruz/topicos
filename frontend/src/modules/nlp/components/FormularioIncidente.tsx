import { FormEvent } from 'react';

interface Propiedades {
  texto: string; cargando: boolean;
  cambiarTexto: (texto: string) => void;
  analizar: () => void; limpiar: () => void;
}
export function FormularioIncidente({ texto, cargando, cambiarTexto, analizar, limpiar }: Propiedades) {
  function enviar(evento: FormEvent) { evento.preventDefault(); analizar(); }
  return <form className="nlp-formulario" onSubmit={enviar}>
    <div className="nlp-fila"><label htmlFor="descripcion-nlp">Descripción del incidente</label>
      {cargando && <span className="nlp-insignia">En análisis</span>}</div>
    <textarea id="descripcion-nlp" rows={5} required minLength={10} maxLength={2000}
      aria-describedby="limite-nlp" placeholder="Describe los síntomas que observas en la red…"
      value={texto} disabled={cargando} onChange={evento => cambiarTexto(evento.target.value)} />
    <div className="nlp-fila nlp-secundario" id="limite-nlp">
      <span>{texto.length} / 2000 caracteres</span><span>Mínimo 10 caracteres</span>
    </div>
    <div className="nlp-acciones">
      <button className="nlp-boton nlp-boton-principal" disabled={cargando} type="submit">
        {cargando && <span className="nlp-spinner" aria-hidden="true" />}
        {cargando ? 'Analizando incidente…' : 'Analizar incidente'}</button>
      <button className="nlp-boton" disabled={cargando} type="button" onClick={limpiar}>Limpiar</button>
    </div>
  </form>;
}
