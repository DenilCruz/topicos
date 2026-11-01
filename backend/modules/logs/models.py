"""Expone los modelos de dominio para que Django los registre en la app."""
from modules.logs.domain.models import AuditLog, LogSeverity

__all__ = ['AuditLog', 'LogSeverity']
