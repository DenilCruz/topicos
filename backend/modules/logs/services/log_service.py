from typing import Optional
from django.db.models import QuerySet
from modules.logs.repositories.log_repository import LogRepository
from modules.logs.domain.models import AuditLog, LogSeverity

class LogService:
    """Business service for auditing and monitoring logs."""

    def __init__(self, repository: Optional[LogRepository] = None):
        self._repo = repository or LogRepository()

    def record_http_event(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_identifier: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        severity = LogSeverity.INFO
        if status_code >= 500:
            severity = LogSeverity.ERROR
        elif status_code >= 400:
            severity = LogSeverity.WARNING

        return self._repo.create_log(
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=duration_ms,
            user_identifier=user_identifier,
            ip_address=ip_address,
            severity=severity
        )

    def get_logs(self, severity: Optional[str] = None, user_identifier: Optional[str] = None) -> QuerySet[AuditLog]:
        return self._repo.list_logs(severity=severity, user_identifier=user_identifier)
