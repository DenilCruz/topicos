import { useEffect, useState } from 'react';
import { ExecutiveReport, ReportMetrics } from '../types/reports.types';
import { reportsApi } from '../services/reportsApi';

const extractError = (err: any, fallback: string): string =>
  err?.response?.data?.error?.message || err?.response?.data?.error?.details?.detail || fallback;

export const useReportMetrics = (dias = 7) => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(await reportsApi.getMetrics(dias));
    } catch (err: any) {
      setError(extractError(err, 'Error al obtener las métricas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dias]);

  return { metrics, loading, error, refresh: fetchMetrics };
};

export const useExecutiveReport = (dias = 7) => {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await reportsApi.getExecutiveReport(dias));
    } catch (err: any) {
      setError(extractError(err, 'Error al generar el reporte ejecutivo.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dias]);

  return { report, loading, error, refresh: fetchReport };
};
