import { useEffect, useMemo, useRef, useState } from 'react';
import { reportsApi } from '../services/reportsApi';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
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

export function useVoiceReport() {
  const [requestState, setRequestState] = useState<'idle' | 'processing' | 'error'>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [proveedor, cambiarProveedor] = useState<'deepseek' | 'groq'>('groq');
  const [lastQuery, setLastQuery] = useState('');
  const [typedQuery, setTypedQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const speech = useSpeechSynthesis();

  // Cancela cualquier petición en curso al salir de la vista
  useEffect(() => () => abortRef.current?.abort(), []);

  const sendQuery = async (texto: string, origen: 'texto' | 'voz' = 'texto') => {
    const query = texto.trim();
    if (!query) return;
    if (origen === 'texto') {
      recognition.cancel();
      recognition.reset();
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    speech.stop();
    setResult(null);
    setLastQuery(query);
    setRequestState('processing');
    setRequestError(null);
    try {
      const data = await reportsApi.generateReportFromVoice(query, controller.signal, 7, proveedor);
      if (controller.signal.aborted) return;
      setResult({ title: origen === 'voz' ? 'Reporte generado por voz' : 'Reporte de consulta escrita', query: data.query, markdown: data.markdown_report });
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
      if (text.trim()) sendQuery(text, 'voz');
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
      const report = await reportsApi.getExecutiveReport(7, proveedor);
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
  const errorMessage = requestError || recognition.error;

  const transcript = recognition.finalText || lastQuery;
  const rendered = useMemo(() => (result ? renderMarkdown(result.markdown) : []), [result]);
  const plainText = useMemo(() => (result ? stripMarkdown(result.markdown) : ''), [result]);

  const statusLabel: Record<ViewStatus, string> = {
    idle: recognition.supported ? 'Pulsa el micrófono y haz tu consulta' : 'Escribe tu consulta',
    listening: 'Escuchando… pulsa de nuevo para terminar',
    processing: 'Consulta enviada',
    error: 'Ocurrió un problema',
  };

  return { result, setResult, proveedor, cambiarProveedor, typedQuery, setTypedQuery, speech,
    sendQuery, recognition, cancelRequest, handleMicClick, loadWeeklySummary, status, errorMessage,
    transcript, rendered, plainText, statusLabel, requestError, lastQuery };
}
export type ControlVoz = ReturnType<typeof useVoiceReport>;
