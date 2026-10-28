import React, { useState } from 'react';
import { useNlp } from '../hooks/useNlp';

export const NlpDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const { analysis, loading, error, analyze, clear } = useNlp();

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(inputText);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Módulo de Procesamiento de Lenguaje Natural (NLP)</h1>

      <form onSubmit={handleProcess} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontWeight: 500 }}>Texto a procesar:</label>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe o pega aquí el texto a analizar..."
          style={{ width: '100%', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
            {loading ? 'Analizando...' : 'Ejecutar Análisis'}
          </button>
          <button
            type="button"
            onClick={() => { setInputText(''); clear(); }}
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {analysis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Análisis de Sentimiento</h3>
            <p><strong>Categoría:</strong> {analysis.sentiment.label}</p>
            <p><strong>Puntaje:</strong> {analysis.sentiment.score}</p>
            <p><strong>Tokens:</strong> {analysis.sentiment.tokens_count}</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Resumen Automático</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{analysis.summary || 'No se generó resumen.'}</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Entidades Detectadas ({analysis.entities.length})</h3>
            {analysis.entities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No se identificaron entidades clave.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {analysis.entities.map((ent, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {ent.text} ({ent.type})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
