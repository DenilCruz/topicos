from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsAdminRole
from modules.logs.domain.models import AuditLog
from modules.logs.api.serializers import AuditLogSerializer
from modules.logs.services.log_service import LogService

class AuditLogListView(ListAPIView):
    """Lists audit logs with optional filtering by severity and user."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        severity = self.request.query_params.get('severity')
        user = self.request.query_params.get('user')
        service = LogService()
        return service.get_logs(severity=severity, user_identifier=user)
