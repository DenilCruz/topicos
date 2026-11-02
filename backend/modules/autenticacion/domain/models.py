from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    OPERATOR = 'OPERATOR', 'Operador'
    AUDITOR = 'AUDITOR', 'Auditor'
    USER = 'USER', 'Usuario'
    TECNICO = 'TECNICO', 'TÃ©cnico'
    CLIENTE = 'CLIENTE', 'Cliente'

class UserProfile(models.Model):
    """
    Extiende la informaciÃ³n del usuario con roles de negocio y metadatos.
    """
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def formatted_roles(self):
        """Retorna la lista de roles en formato estÃ¡ndar RBAC (ej: ['ROLE_ADMIN'])."""
        role_name = self.role
        return [role_name if role_name.startswith('ROLE_') else f"ROLE_{role_name}"]

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class AuditLog(models.Model):
    """Mapeo de la tabla de auditoría existente, administrada en Supabase."""
    usuario = models.CharField(max_length=100, null=True, blank=True)
    ip_origen = models.CharField(max_length=45, null=True, blank=True)
    metodo_accion = models.CharField(max_length=100, null=True, blank=True)
    parametros_entrada = models.TextField(null=True, blank=True)
    texto_analizado = models.TextField(null=True, blank=True)
    prediccion_emitida = models.CharField(max_length=100, null=True, blank=True)
    tiempo_ejecucion_ms = models.IntegerField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'audit_logs'
        ordering = ['-fecha_registro']

    def __str__(self):
        return f"{self.metodo_accion} - {self.usuario} ({self.fecha_registro})"
