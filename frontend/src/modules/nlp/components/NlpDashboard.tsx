import { useState, FormEvent } from 'react';
import { useNlp } from '../hooks/useNlp';
import { ResultadoDiagnostico } from './ResultadoDiagnostico';
import { PasosPreprocesamiento } from './PasosPreprocesamiento';

export function NlpDashboard() {
  const [texto, cambiarTexto] = useState('');
  const { analysis, loading, error, analyze, clear } = useNlp();
  function procesar(evento: FormEvent) {
    evento.preventDefault();
    void analyze(texto);
  }
  return <main style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
    <h1>Clasificación de incidentes de red</h1>
    <p>Describe un incidente para consultar su categoría y ver cómo se procesa el texto.</p>
    <form onSubmit={procesar} style={{ display: 'grid', gap: '1rem' }}>
      <label htmlFor="descripcion-nlp">Descripción del incidente (10 a 2000 caracteres)</label>
      <textarea id="descripcion-nlp" rows={6} required minLength={10} maxLength={2000}
        value={texto} disabled={loading} onChange={evento => { cambiarTexto(evento.target.value); clear(); }} />
      <span>{texto.length}/2000 caracteres</span>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button disabled={loading} type="submit">{loading ? 'Analizando…' : 'Analizar incidente'}</button>
        <button disabled={loading} type="button" onClick={() => { cambiarTexto(''); clear(); }}>Limpiar</button>
      </div>
    </form>
    <div aria-live="polite">{loading && <p>Procesando el incidente…</p>}</div>
    {error && <p role="alert">{error}</p>}
    {analysis && <><ResultadoDiagnostico resultado={analysis} />
      <PasosPreprocesamiento pasos={analysis.preprocesamiento} /></>}
  </main>;
}
