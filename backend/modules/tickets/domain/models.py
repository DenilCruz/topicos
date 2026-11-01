"""
Modelos mapeados sobre el esquema existente en Supabase (tablas tickets, usuarios y dispositivos).
managed = False: Django no crea, altera ni elimina estas tablas.
"""
from django.db import models

class TicketEstado(models.TextChoices):
    PENDIENTE_DIAGNOSTICO = 'PENDIENTE_DIAGNOSTICO', 'Pendiente de diagnóstico'
    DIAGNOSTICADO = 'DIAGNOSTICADO', 'Diagnosticado'
    EN_PROCESO = 'EN_PROCESO', 'En proceso'
    RESUELTO = 'RESUELTO', 'Resuelto'

class TicketPrioridad(models.TextChoices):
    ALTA = 'Alta', 'Alta'
    MEDIA = 'Media', 'Media'
    BAJA = 'Baja', 'Baja'

class Usuario(models.Model):
    """Usuario de negocio de la tabla usuarios (independiente de auth_user)."""
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    roles = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

    def __str__(self):
        return self.username

class Dispositivo(models.Model):
    """Dispositivo de red de la tabla dispositivos."""
    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, null=True, blank=True)
    ubicacion = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'dispositivos'

    def __str__(self):
        return self.nombre

class Ticket(models.Model):
    """
    Incidente de red reportado en lenguaje natural y asociado a un dispositivo.
    """
    id = models.BigAutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.DO_NOTHING, db_column='dispositivo_id', null=True, related_name='tickets')
    usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id', null=True, related_name='tickets')
    estado = models.CharField(max_length=50, choices=TicketEstado.choices, default=TicketEstado.PENDIENTE_DIAGNOSTICO)
    # Columna timestamp sin zona: con USE_TZ=True y conexión en UTC se guarda en UTC
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    # Diagnóstico de ML: vacío hasta que el pipeline de inferencia (UC-BE-03) lo asigne
    categoria_predecida = models.CharField(max_length=100, null=True, blank=True)
    probabilidad = models.DecimalField(max_digits=4, decimal_places=3, null=True, blank=True)
    prioridad = models.CharField(max_length=20, choices=TicketPrioridad.choices, null=True, blank=True)
    tiempo_inferencia_ms = models.IntegerField(null=True, blank=True)

    # Orquestación Bonita BPM (UC-BE-06 / UC-BE-07)
    case_id_bonita = models.CharField(max_length=100, null=True, blank=True)
    usuario_asignado = models.CharField(max_length=100, null=True, blank=True)
    comentario_tecnico = models.TextField(null=True, blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        managed = False
        db_table = 'tickets'
        ordering = ['-fecha_creacion', '-id']

    def __str__(self):
        return f"#{self.pk} {self.titulo} ({self.estado})"
