import { useState, useEffect } from 'react';
import { CreateTicketPayload, Dispositivo, Ticket, TicketFilterParams } from '../types/tickets.types';
import { ticketsApi } from '../services/ticketsApi';

const PAGE_SIZE = 10;

const extractError = (err: any, fallback: string): string => {
  const details = err?.response?.data?.error?.details;
  if (details && typeof details === 'object') {
    const first = Object.values(details)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return err?.response?.data?.error?.message || fallback;
};

export const useTickets = () => {
  const [opciones, cambiarOpciones] = useState<{ estados: string[]; prioridades: string[] }>({ estados: [], prioridades: [] });
  useEffect(() => { let activo = true; ticketsApi.getOpciones().then(datos => { if (activo) cambiarOpciones(datos); }).catch(() => {}); return () => { activo = false; }; }, []);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilterParams>({ page: 1, size: PAGE_SIZE });
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);

  const fetchTickets = async (currentFilters: TicketFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getTickets(currentFilters);
      setTickets(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setTickets([]);
      setError(extractError(err, 'Error al obtener los tickets.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(filters);
  }, [filters]);

  useEffect(() => {
    ticketsApi.getDispositivos().then(setDispositivos).catch(() => setDispositivos([]));
  }, []);

  // Cualquier cambio de filtro vuelve a la primera página
  const updateFilters = (newFilters: Partial<TicketFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const createTicket = async (payload: CreateTicketPayload): Promise<string | null> => {
    try {
      await ticketsApi.createTicket(payload);
      setFilters((prev) => ({ ...prev, page: 1 }));
      await fetchTickets({ ...filters, page: 1 });
      return null;
    } catch (err: any) {
      return extractError(err, 'Error al crear el ticket.');
    }
  };

  return {
    opciones,
    tickets,
    dispositivos,
    loading,
    error,
    filters,
    totalElements,
    totalPages,
    updateFilters,
    goToPage,
    createTicket,
    refresh: () => fetchTickets(filters),
  };
};
