import { httpClient } from '@/shared/http/client';
import type { Ticket, TicketPage } from '@/modules/tickets/types/tickets.types';
import { ExecutiveReport, ReportMetrics, ReportTicketFilters, VoiceReportResponse } from '../types/reports.types';

const EXPORT_PAGE_SIZE = 100;

export const reportsApi = {
  getOptions: async (): Promise<{ estados: string[]; prioridades: string[] }> => {
    const respuesta = await httpClient.get('/reports/opciones');
    return respuesta.data;
  },
  /** Métricas crudas del ORM; no invoca al LLM. */
  getMetrics: async (dias = 7): Promise<ReportMetrics> => {
    const response = await httpClient.get<{ metrics: ReportMetrics }>('/reports/metrics', { params: { dias } });
    return response.data.metrics;
  },

  /** Métricas + resumen ejecutivo en Markdown redactado por DeepSeek. */
  getExecutiveReport: async (dias = 7, proveedor: 'deepseek' | 'groq' = 'deepseek'): Promise<ExecutiveReport> => {
    const response = await httpClient.get<ExecutiveReport>('/reports/executive', { params: { dias, proveedor }, timeout: 60000 });
    return response.data;
  },

  /** Envía la consulta transcrita por voz; el backend responde un reporte en Markdown generado con IA. */
  generateReportFromVoice: async (texto: string, signal?: AbortSignal, dias = 7, proveedor: 'deepseek' | 'groq' = 'deepseek'): Promise<VoiceReportResponse> => {
    const response = await httpClient.post<VoiceReportResponse>('/reports/voice', { texto, dias, proveedor }, { signal, timeout: 60000 });
    return response.data;
  },

  getTicketsPage: async (filters: ReportTicketFilters): Promise<TicketPage> => {
    const response = await httpClient.get<TicketPage>('/tickets', { params: filters });
    return response.data;
  },

  /** Recorre todas las páginas con los filtros actuales para exportar el historial completo. */
  getAllTickets: async (filters: ReportTicketFilters): Promise<Ticket[]> => {
    const all: Ticket[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const data = await reportsApi.getTicketsPage({ ...filters, page, size: EXPORT_PAGE_SIZE });
      all.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    } while (page <= totalPages);
    return all;
  },
};
