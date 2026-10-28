import { httpClient } from '@/shared/http/client';
import { PaginatedResult } from '@/shared/types/common.types';
import { AuditLogItem, LogFilterParams } from '../types/logs.types';

export const logsApi = {
  getAuditLogs: async (filters: LogFilterParams = {}): Promise<PaginatedResult<AuditLogItem>> => {
    const response = await httpClient.get<PaginatedResult<AuditLogItem>>('/logs/', { params: filters });
    return response.data;
  },
};
