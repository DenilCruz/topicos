from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    OPERATOR = 'OPERATOR', 'Operador'
    AUDITOR = 'AUDITOR', 'Auditor'
    USER = 'USER', 'Usuario'

class UserProfile(models.Model):
    """
    Extiende la información del usuario con roles de negocio y metadatos.
    """
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
