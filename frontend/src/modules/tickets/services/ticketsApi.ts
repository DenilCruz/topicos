import { httpClient } from '@/shared/http/client';
import { ApiResponse } from '@/shared/types/common.types';
import { CreateTicketPayload, Dispositivo, Ticket, TicketFilterParams, TicketPage } from '../types/tickets.types';

export const ticketsApi = {
  getTickets: async (filters: TicketFilterParams = {}): Promise<TicketPage> => {
    const response = await httpClient.get<TicketPage>('/tickets', { params: filters });
    return response.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const response = await httpClient.post<ApiResponse<Ticket>>('/tickets', payload);
    return response.data.data;
  },

  getDispositivos: async (): Promise<Dispositivo[]> => {
    const response = await httpClient.get<Dispositivo[]>('/dispositivos/');
    return response.data;
  },
};
