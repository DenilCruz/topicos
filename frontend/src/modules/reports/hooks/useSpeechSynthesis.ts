import { useEffect, useRef, useState } from 'react';

export type SpeechStatus = 'idle' | 'speaking' | 'paused';

const LANG = 'es-ES';

/** Divide en frases cortas: Chrome corta los enunciados largos pasados ~15 s. */
const splitSentences = (text: string, maxLength = 220): string[] => {
  const sentences = text.match(/[^.!?;:]+[.!?;:]*/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences.map((s) => s.trim()).filter(Boolean)) {
    if ((current + ' ' + sentence).trim().length > maxLength && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = (current + ' ' + sentence).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

export const useSpeechSynthesis = () => {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const runId = useRef(0);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  // Preferimos una voz es-ES; si no hay, cualquier voz en español
  const voice = voices.find((v) => v.lang === LANG) || voices.find((v) => v.lang.toLowerCase().startsWith('es')) || null;

  const speak = (text: string) => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const id = ++runId.current;
    const chunks = splitSentences(text);

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = LANG;
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      if (index === chunks.length - 1) {
        utterance.onend = () => { if (runId.current === id) setStatus('idle'); };
      }
      utterance.onerror = () => { if (runId.current === id) setStatus('idle'); };
      window.speechSynthesis.speak(utterance);
    });
    setStatus('speaking');
  };

  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  };

  const resume = () => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus('speaking');
  };

  const stop = () => {
    if (!supported) return;
    runId.current += 1;
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  return { supported, status, voiceName: voice ? `${voice.name} (${voice.lang})` : null, speak, pause, resume, stop };
};
