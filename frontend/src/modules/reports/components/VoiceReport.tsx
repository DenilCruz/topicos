import React, { useEffect, useMemo, useRef, useState } from 'react';
import { reportsApi } from '../services/reportsApi';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { renderMarkdown, stripMarkdown } from '../utils/markdown';

type ViewStatus = 'idle' | 'listening' | 'processing' | 'error';

interface ReportResult {
  title: string;
  query: string | null;
  markdown: string;
}

const extractError = (err: any): string =>
  err?.response?.data?.error?.message
  || err?.response?.data?.error?.details?.texto?.[0]
  || (err?.code === 'ECONNABORTED' ? 'El servidor tardó demasiado en responder.' : 'No fue posible generar el reporte.');

const MicIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const StopIcon: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const VoiceReport: React.FC = () => {
  const [requestState, setRequestState] = useState<'idle' | 'processing' | 'error'>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [typedQuery, setTypedQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const speech = useSpeechSynthesis();

  // Cancela cualquier petición en curso al salir de la vista
  useEffect(() => () => abortRef.current?.abort(), []);

  const sendQuery = async (texto: string) => {
    const query = texto.trim();
    if (!query) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    speech.stop();
    setLastQuery(query);
    setRequestState('processing');
    setRequestError(null);
    try {
      const data = await reportsApi.generateReportFromVoice(query, controller.signal);
      if (controller.signal.aborted) return;
      setResult({ title: 'Reporte generado por voz', query: data.query, markdown: data.markdown_report });
      setRequestState('idle');
    } catch (err: any) {
      if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return;
      setRequestError(extractError(err));
      setRequestState('error');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const recognition = useSpeechRecognition({
    lang: 'es-ES',
    onFinished: (text) => {
      if (text.trim()) sendQuery(text);
    },
  });

  const cancelRequest = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRequestState('idle');
  };

  const handleMicClick = () => {
    if (recognition.status === 'listening') {
      recognition.stop(); // onend envía el texto al backend
    } else {
      speech.stop();
      setRequestError(null);
      setRequestState('idle');
      recognition.start();
    }
  };

  const loadWeeklySummary = async () => {
    abortRef.current?.abort();
    speech.stop();
    setRequestState('processing');
    setRequestError(null);
    try {
      const report = await reportsApi.getExecutiveReport(7);
      if (report.executive_summary_md) {
        setResult({ title: 'Resumen ejecutivo semanal', query: null, markdown: report.executive_summary_md });
        setRequestState('idle');
      } else {
        setRequestError(report.summary_error?.message || 'El resumen no está disponible.');
        setRequestState('error');
      }
    } catch (err: any) {
      setRequestError(extractError(err));
      setRequestState('error');
    }
  };

  const status: ViewStatus =
    recognition.status === 'listening' ? 'listening'
    : requestState === 'processing' ? 'processing'
    : recognition.status === 'error' || requestState === 'error' ? 'error'
    : 'idle';
  const errorMessage = recognition.error || requestError;

  const transcript = recognition.finalText || lastQuery;
  const rendered = useMemo(() => (result ? renderMarkdown(result.markdown) : []), [result]);
  const plainText = useMemo(() => (result ? stripMarkdown(result.markdown) : ''), [result]);

  const statusLabel: Record<ViewStatus, string> = {
    idle: recognition.supported ? 'Pulsa el micrófono y haz tu consulta' : 'Escribe tu consulta',
    listening: 'Escuchando… pulsa de nuevo para terminar',
    processing: 'Consulta enviada',
    error: 'Ocurrió un problema',
  };

  const secondaryButton: React.CSSProperties = { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Análisis por Voz (IA)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Pregunta en voz alta sobre los incidentes de red; DeepSeek responde usando solo las métricas del sistema.
          </p>
        </div>
        <button onClick={loadWeeklySummary} disabled={status === 'processing' || status === 'listening'}
          style={{ ...secondaryButton, opacity: status === 'processing' || status === 'listening' ? 0.6 : 1 }}>
          Resumen semanal
        </button>
      </div>

      {/* Captura de voz */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        {recognition.supported ? (
          <>
            <button
              className={`mic-button${status === 'listening' ? ' listening' : ''}`}
              onClick={handleMicClick}
              disabled={status === 'processing'}
              aria-pressed={status === 'listening'}
              aria-label={status === 'listening' ? 'Detener y enviar consulta' : 'Hablar con el micrófono'}
            >
              {status === 'listening' ? <StopIcon /> : <MicIcon />}
            </button>
            <span aria-live="polite" style={{ fontSize: '0.9rem', color: status === 'listening' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: status === 'listening' ? 600 : 400 }}>
              {statusLabel[status]}
            </span>
          </>
        ) : (
          <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
              ⚠ Este navegador no soporta reconocimiento de voz (usa Chrome o Edge). Puedes escribir la consulta:
            </p>
            <form onSubmit={(e) => { e.preventDefault(); sendQuery(typedQuery); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={typedQuery} onChange={(e) => setTypedQuery(e.target.value)} maxLength={1000}
                placeholder="¿Cuántos tickets siguen pendientes de diagnóstico?" style={{ flex: 1 }} />
              <button type="submit" disabled={!typedQuery.trim() || status === 'processing'} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                Enviar
              </button>
            </form>
          </div>
        )}

        {/* Transcripción en vivo */}
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <label htmlFor="transcripcion" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transcripción</label>
          <p
            id="transcripcion"
            aria-live="polite"
            aria-readonly="true"
            style={{
              marginTop: '0.35rem',
              minHeight: '3.2rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              border: `1px solid ${status === 'listening' ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '1rem',
              lineHeight: 1.5,
            }}
          >
            {transcript || recognition.interimText ? (
              <>
                {transcript}
                {recognition.interimText && (
                  <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}> {recognition.interimText}</span>
                )}
              </>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>
                Ej.: “¿Cuál es la categoría de falla más frecuente y qué cuellos de botella hay?”
              </span>
            )}
          </p>
        </div>

        {status === 'processing' && (
          <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span className="spinner" aria-hidden="true" />
            Generando reporte con IA…
            <button onClick={cancelRequest} style={{ ...secondaryButton, padding: '4px 10px', fontSize: '0.8rem' }}>Cancelar</button>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div role="alert" style={{ width: '100%', maxWidth: '640px', padding: '0.85rem 1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span>{errorMessage}</span>
            {requestError && lastQuery && (
              <button onClick={() => sendQuery(lastQuery)} style={{ ...secondaryButton, padding: '4px 10px', fontSize: '0.8rem', flexShrink: 0 }}>
                Reintentar
              </button>
            )}
          </div>
        )}
      </section>

      {/* Panel de lectura del reporte */}
      {result && (
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: status === 'processing' ? 0.5 : 1 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>{result.title}</h3>
              {result.query && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Consulta: “{result.query}”</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {speech.status === 'idle' ? (
                <button onClick={() => speech.speak(plainText)} disabled={!speech.supported}
                  style={{ backgroundColor: 'var(--primary)', color: '#fff', opacity: speech.supported ? 1 : 0.5 }}>
                  ▶ Reproducir respuesta
                </button>
              ) : (
                <>
                  {speech.status === 'speaking'
                    ? <button onClick={speech.pause} style={{ backgroundColor: 'var(--warning)', color: '#0b0b0b' }}>❚❚ Pausar</button>
                    : <button onClick={speech.resume} style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>▶ Continuar</button>}
                  <button onClick={speech.stop} style={secondaryButton}>■ Detener</button>
                </>
              )}
            </div>
          </header>
          <article style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
            {rendered}
          </article>
        </section>
      )}
    </div>
  );
};
