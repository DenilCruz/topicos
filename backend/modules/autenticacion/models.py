"""Expone los modelos de dominio para que Django los registre en la app."""
from modules.autenticacion.domain.models import RoleChoices, UserProfile

__all__ = ['RoleChoices', 'UserProfile']
