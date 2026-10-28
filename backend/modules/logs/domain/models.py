from django.db import models

class LogSeverity(models.TextChoices):
    INFO = 'INFO', 'Información'
    WARNING = 'WARNING', 'Advertencia'
    ERROR = 'ERROR', 'Error'
    CRITICAL = 'CRITICAL', 'Crítico'

class AuditLog(models.Model):
    """
    Entidad de dominio para almacenar auditoría de peticiones y eventos del sistema.
    """
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user_identifier = models.CharField(max_length=150, null=True, blank=True, db_index=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500, db_index=True)
    status_code = models.IntegerField()
    duration_ms = models.FloatField(default=0.0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    severity = models.CharField(max_length=15, choices=LogSeverity.choices, default=LogSeverity.INFO)
    message = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.severity}] {self.method} {self.path} - {self.status_code} ({self.timestamp})"
