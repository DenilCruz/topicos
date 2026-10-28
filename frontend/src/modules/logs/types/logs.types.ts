export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user_identifier: string | null;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  ip_address: string | null;
  severity: LogSeverity;
  message: string;
}

export interface LogFilterParams {
  severity?: string;
  user?: string;
  page?: number;
}
