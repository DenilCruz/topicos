export type TicketEstado = 'PENDIENTE_DIAGNOSTICO' | 'DIAGNOSTICADO' | 'EN_PROCESO' | 'RESUELTO';
export type TicketPrioridad = 'Alta' | 'Media' | 'Baja';

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  dispositivoId: number | null;
  dispositivoNombre: string | null;
  usuarioId: number | null;
  usuarioNombre: string | null;
  estado: TicketEstado;
  categoria: string | null;
  probabilidad: number | null;
  prioridad: TicketPrioridad | null;
  tiempoInferenciaMs: number | null;
  fechaCreacion: string;
}

export interface CreateTicketPayload {
  titulo: string;
  descripcion: string;
  dispositivoId: number;
}

export interface TicketFilterParams {
  categoria?: string;
  prioridad?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  size?: number;
}

/** Respuesta paginada de GET /tickets (UC-BE-02). */
export interface TicketPage {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface Dispositivo {
  id: number;
  nombre: string;
  tipo: string | null;
  ubicacion: string | null;
}
