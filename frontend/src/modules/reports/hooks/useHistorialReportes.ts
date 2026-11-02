import { useEffect, useState } from 'react';
import type { Ticket } from '@/modules/tickets/types/tickets.types';
import { reportsApi } from '../services/reportsApi';
import { ReportTicketFilters } from '../types/reports.types';
import { exportTicketsToCsv, exportTicketsToPdf, openPrintWindow } from '../utils/export';
const describeFilters = (f: ReportTicketFilters) => {
  const parts = [
    f.estado && `estado ${f.estado}`,
    f.prioridad && `prioridad ${f.prioridad}`,
    f.fechaInicio && `desde ${f.fechaInicio}`,
    f.fechaFin && `hasta ${f.fechaFin}`,
  ].filter(Boolean);
  return parts.length ? `Filtros: ${parts.join(', ')}` : 'Sin filtros';
};

export function useHistorialReportes() {
  const [filters, setFilters] = useState<ReportTicketFilters>({ page: 1, size: 10 });
  const [opciones, cambiarOpciones] = useState<{ estados: string[]; prioridades: string[] }>({ estados: [], prioridades: [] });
  useEffect(() => { let vigente = true; reportsApi.getOptions().then(datos => { if (vigente) cambiarOpciones(datos); }).catch(() => {}); return () => { vigente = false; }; }, []);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reportsApi
      .getTicketsPage(filters)
      .then((data) => {
        if (cancelled) return;
        setTickets(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch((err: any) => !cancelled && setError(err?.response?.data?.error?.message || 'Error al obtener el historial.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = (changes: Partial<ReportTicketFilters>) => setFilters((prev) => ({ ...prev, ...changes, page: 1 }));
  const page = filters.page || 1;
  const { page: _p, size: _s, ...exportFilters } = filters;

  const handleCsv = async () => {
    setExporting('csv');
    setError(null);
    try {
      exportTicketsToCsv(await reportsApi.getAllTickets(exportFilters));
    } catch {
      setError('No fue posible exportar a CSV.');
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    const win = openPrintWindow();
    if (!win) {
      setError('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para exportar a PDF.');
      return;
    }
    setExporting('pdf');
    setError(null);
    try {
      exportTicketsToPdf(win, await reportsApi.getAllTickets(exportFilters), describeFilters(filters));
    } catch {
      win.close();
      setError('No fue posible exportar a PDF.');
    } finally {
      setExporting(null);
    }
  };

  return { filters, tickets, totalElements, totalPages, loading, error, exporting, page, opciones,
    updateFilters, handleCsv, handlePdf, cambiarPagina: (page: number) => setFilters(f => ({ ...f, page })) };
}
