import { useEffect, useRef, useState } from 'react';

// Tipos mínimos de la Web Speech API (no vienen en lib.dom de TypeScript)
interface SpeechRecognitionAlternativeLike { transcript: string }
interface SpeechRecognitionResultLike { isFinal: boolean; 0: SpeechRecognitionAlternativeLike }
interface SpeechRecognitionEventLike { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionErrorEventLike { error: string }
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Permiso de micrófono denegado. Habilítalo en el candado de la barra de direcciones y vuelve a intentar.',
  'service-not-allowed': 'El navegador no permite el reconocimiento de voz en esta página.',
  'audio-capture': 'No se detectó ningún micrófono. Conecta uno y vuelve a intentar.',
  'no-speech': 'No se escuchó nada. Pulsa el micrófono y habla con claridad.',
  'network': 'El reconocimiento de voz necesita conexión a internet (lo procesa el navegador en sus servidores).',
  'language-not-supported': 'El idioma es-ES no está disponible en este navegador.',
};

export type RecognitionStatus = 'idle' | 'listening' | 'error';

interface Options {
  lang?: string;
  /** Se llama al terminar de escuchar con el texto final reconocido (puede ser vacío). */
  onFinished?: (finalText: string) => void;
}

export const useSpeechRecognition = ({ lang = 'es-ES', onFinished }: Options = {}) => {
  const Ctor = getRecognitionCtor();
  const supported = Boolean(Ctor);
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const hadErrorRef = useRef(false);
  // Siempre la versión más reciente del callback, sin recrear el reconocedor
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const detach = (rec: SpeechRecognitionLike | null) => {
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
  };

  // Ciclo de vida: al desmontar se liberan el micrófono y los handlers
  useEffect(() => () => {
    const rec = recognitionRef.current;
    detach(rec);
    rec?.abort();
    recognitionRef.current = null;
  }, []);

  const start = async () => {
    if (!Ctor || status === 'listening') return;

    // Si el permiso ya fue denegado, avisamos antes de intentarlo
    try {
      const perm = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
      if (perm?.state === 'denied') {
        setError(ERROR_MESSAGES['not-allowed']);
        setStatus('error');
        return;
      }
    } catch {
      // Algunos navegadores no exponen el permiso 'microphone'; el propio start() lo solicitará
    }

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false; // termina solo tras una pausa al hablar
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    finalRef.current = '';
    hadErrorRef.current = false;
    setFinalText('');
    setInterimText('');
    setError(null);

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalRef.current = `${finalRef.current} ${result[0].transcript}`.trim();
        else interim += result[0].transcript;
      }
      setFinalText(finalRef.current);
      setInterimText(interim.trim());
    };

    rec.onerror = (event) => {
      if (event.error === 'aborted') return;
      hadErrorRef.current = true;
      setError(ERROR_MESSAGES[event.error] || `Error de reconocimiento de voz (${event.error}).`);
      setStatus('error');
    };

    rec.onend = () => {
      detach(rec);
      if (recognitionRef.current === rec) recognitionRef.current = null;
      setInterimText('');
      if (!hadErrorRef.current) {
        setStatus('idle');
        onFinishedRef.current?.(finalRef.current);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setStatus('listening');
    } catch {
      detach(rec);
      recognitionRef.current = null;
      setError('No fue posible iniciar el micrófono.');
      setStatus('error');
    }
  };

  /** Detiene la escucha; onend entregará el texto reconocido. */
  const stop = () => recognitionRef.current?.stop();

  /** Cancela sin enviar nada. */
  const cancel = () => {
    const rec = recognitionRef.current;
    detach(rec);
    rec?.abort();
    recognitionRef.current = null;
    setInterimText('');
    setStatus('idle');
  };

  const reset = () => {
    finalRef.current = '';
    setFinalText('');
    setInterimText('');
    setError(null);
    setStatus('idle');
  };

  return { supported, status, finalText, interimText, error, start, stop, cancel, reset };
};
