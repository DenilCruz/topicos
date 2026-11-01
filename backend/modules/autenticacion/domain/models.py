from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    OPERATOR = 'OPERATOR', 'Operador'
    AUDITOR = 'AUDITOR', 'Auditor'
    USER = 'USER', 'Usuario'
    TECNICO = 'TECNICO', 'Técnico'
    CLIENTE = 'CLIENTE', 'Cliente'

class UserProfile(models.Model):
    """
    Extiende la información del usuario con roles de negocio y metadatos.
    """
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def formatted_roles(self):
        """Retorna la lista de roles en formato estándar RBAC (ej: ['ROLE_ADMIN'])."""
        role_name = self.role
        return [role_name if role_name.startswith('ROLE_') else f"ROLE_{role_name}"]

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class AuditLog(models.Model):
    """
    Entidad de auditoría del Módulo 04 (UC-BE-09).
    Persiste en la tabla audit_logs de PostgreSQL/SQLite para garantizar
    la trazabilidad inalterable de operaciones y diagnósticos de ML.
    """
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user_identifier = models.CharField(max_length=150, null=True, blank=True, db_index=True)
    method = models.CharField(max_length=10, default='AUDIT')
    path = models.CharField(max_length=500, db_index=True)
    status_code = models.IntegerField(default=200)
    duration_ms = models.FloatField(default=0.0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    severity = models.CharField(max_length=15, default='INFO')
    message = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.severity}] {self.method} {self.path} - {self.status_code} ({self.timestamp})"
