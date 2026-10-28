import { useState } from 'react';
import { NlpAnalysisResponse } from '../types/nlp.types';
import { nlpApi } from '../services/nlpApi';

export const useNlp = () => {
  const [analysis, setAnalysis] = useState<NlpAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string) => {
    if (!text.trim()) {
      setError('Por favor ingresa un texto para procesar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await nlpApi.analyzeText(text);
      setAnalysis(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error al procesar el texto.');
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
