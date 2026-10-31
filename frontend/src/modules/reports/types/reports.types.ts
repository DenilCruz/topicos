export interface TopCategoria {
  categoria: string;
  total: number;
}

/** Métricas calculadas por el backend con el ORM (GET /reports/metrics y /reports/executive). */
export interface ReportMetrics {
  generado_en: string;
  ventana_dias: number;
  volumen_ultimos_dias: number;
  total_historico: number;
  top_categorias: TopCategoria[];
  probabilidad_promedio_nlp: number | null;
  tickets_con_diagnostico: number;
  distribucion_prioridad: Record<string, number>;
  distribucion_estado: Record<string, number>;
}

export interface ExecutiveReport {
  metrics: ReportMetrics;
  executive_summary_md: string | null;
  summary_error?: {
    code: string;
    message: string;
  };
}

/** Respuesta de POST /reports/voice. */
export interface VoiceReportResponse {
  query: string;
  markdown_report: string;
  metrics: ReportMetrics;
}

export interface ReportTicketFilters {
  estado?: string;
  prioridad?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  size?: number;
}
