import { httpClient } from '@/shared/http/client';
import { RespuestaLogs, LogFilterParams } from '../types/logs.types';

export const logsApi = {
  getAuditLogs: async (filters: LogFilterParams = {}): Promise<RespuestaLogs> => {
    const response = await httpClient.get<RespuestaLogs>('/logs/', { params: filters });
    return response.data;
  },
};
