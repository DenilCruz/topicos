from typing import Optional, Any
from django.db.models import QuerySet
from modules.logs.domain.models import AuditLog, LogSeverity

class LogRepository:
    """Handles persistence and querying for system audit logs."""

    @staticmethod
    def create_log(
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_identifier: Optional[str] = None,
        ip_address: Optional[str] = None,
        severity: str = LogSeverity.INFO,
        message: str = ''
    ) -> AuditLog:
        return AuditLog.objects.create(
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=duration_ms,
            user_identifier=user_identifier,
            ip_address=ip_address,
            severity=severity,
            message=message
        )

    @staticmethod
    def list_logs(severity: Optional[str] = None, user_identifier: Optional[str] = None) -> QuerySet[AuditLog]:
        queryset = AuditLog.objects.all()
        if severity:
            queryset = queryset.filter(severity=severity)
        if user_identifier:
            queryset = queryset.filter(user_identifier=user_identifier)
        return queryset
