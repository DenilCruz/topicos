import { useState, useEffect } from 'react';
import { AuditLogItem, LogFilterParams } from '../types/logs.types';
import { logsApi } from '../services/logsApi';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filters, setFilters] = useState<LogFilterParams>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchLogs = async (currentFilters: LogFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await logsApi.getAuditLogs(currentFilters);
      setLogs(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error al obtener registros de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filters);
  }, [filters]);

  const updateFilters = (newFilters: Partial<LogFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return { logs, loading, error, totalCount, filters, updateFilters, refresh: () => fetchLogs(filters) };
};
