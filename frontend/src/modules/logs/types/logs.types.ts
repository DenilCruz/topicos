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
  page_size?: number;
  method?: string;
  search?: string;
}

export interface RespuestaLogs {
  results: AuditLogItem[]; count: number; current_page: number; total_pages: number;
  next: string | null; previous: string | null;
  resumen: { total: number; errores: number; advertencias: number; duracion_media_ms: number | null };
  opciones: { severidades: string[]; metodos: string[] };
}
