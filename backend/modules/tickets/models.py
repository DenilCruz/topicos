"""Expone los modelos de dominio para que Django los registre en la app."""
from modules.tickets.domain.models import Dispositivo, Ticket, TicketEstado, TicketPrioridad, Usuario

__all__ = ['Dispositivo', 'Ticket', 'TicketEstado', 'TicketPrioridad', 'Usuario']
