import { useState } from 'react';
import { NlpAnalysisResponse } from '../types/nlp.types';
import { nlpApi } from '../services/nlpApi';

export const useNlp = () => {
  const [analysis, setAnalysis] = useState<NlpAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string) => {
    if (text.trim().length < 10 || text.trim().length > 2000) {
      setError('La descripción debe contener entre 10 y 2000 caracteres.');
      return;
    }
    setAnalysis(null);
    setLoading(true);
    setError(null);
    try {
      const data = await nlpApi.analyzeText(text);
      setAnalysis(data);
    } catch (err: any) {
      const detalle = err?.response?.data?.error?.details;
      setError(err?.response?.data?.error?.message || detalle?.detail || detalle?.texto?.[0] || 'No se pudo analizar el texto. Comprueba la conexión y tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setAnalysis(null);
    setError(null);
  };

  return { analysis, loading, error, analyze, clear };
};
