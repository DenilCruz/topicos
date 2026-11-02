import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogFilterParams, RespuestaLogs } from '../types/logs.types';
import { logsApi } from '../services/logsApi';

export function useAuditLogs() {
  const [datos, cambiarDatos] = useState<RespuestaLogs | null>(null);
  const [filters, cambiarFiltros] = useState<LogFilterParams>({ page: 1, page_size: 20 });
  const [loading, cambiarCarga] = useState(true);
  const [error, cambiarError] = useState('');
  const [actualizado, cambiarActualizado] = useState<Date | null>(null);
  const [intento, cambiarIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    cambiarCarga(true); cambiarError('');
    logsApi.getAuditLogs(filters).then(respuesta => {
      if (vigente) { cambiarDatos(respuesta); cambiarActualizado(new Date()); }
    }).catch((fallo: unknown) => {
      if (!vigente) return;
      cambiarDatos(null);
      const detalle = axios.isAxiosError(fallo) ? fallo.response?.data?.error : null;
      cambiarError(detalle?.message || detalle?.details?.detail || 'No se pudieron cargar los registros.');
    }).finally(() => { if (vigente) cambiarCarga(false); });
    return () => { vigente = false; };
  }, [filters, intento]);
  function updateFilters(cambios: Partial<LogFilterParams>) {
    cambiarFiltros(anteriores => ({ ...anteriores, ...cambios, page: cambios.page ?? 1 }));
  }
  return { datos, loading, error, filters, updateFilters, actualizado,
    refresh: () => cambiarIntento(valor => valor + 1) };
}
