from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsAdminRole
from modules.logs.domain.models import AuditLog
from modules.logs.api.serializers import AuditLogSerializer
from modules.logs.services.log_service import LogService
from django.db.models import Q, Count, Avg

class AuditLogListView(ListAPIView):
    """Lists audit logs with optional filtering by severity and user."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        severity = self.request.query_params.get('severity')
        user = self.request.query_params.get('user')
        service = LogService()
        registros = service.get_logs(severity=severity, user_identifier=user)
        metodo = self.request.query_params.get('method')
        busqueda = self.request.query_params.get('search', '').strip()
        if metodo:
            registros = registros.filter(method=metodo)
        if busqueda:
            registros = registros.filter(Q(path__icontains=busqueda) | Q(message__icontains=busqueda)
                                         | Q(user_identifier__icontains=busqueda) | Q(ip_address__icontains=busqueda))
        return registros.order_by('-timestamp', '-id')

    def list(self, request, *args, **kwargs):
        registros = self.filter_queryset(self.get_queryset())
        pagina = self.paginate_queryset(registros)
        respuesta = self.get_paginated_response(self.get_serializer(pagina, many=True).data)
        respuesta.data['resumen'] = registros.aggregate(
            total=Count('id'), errores=Count('id', filter=Q(status_code__gte=500)),
            advertencias=Count('id', filter=Q(status_code__gte=400, status_code__lt=500)),
            duracion_media_ms=Avg('duration_ms'))
        respuesta.data['opciones'] = {
            'severidades': list(AuditLog.objects.order_by('severity').values_list('severity', flat=True).distinct()),
            'metodos': list(AuditLog.objects.order_by('method').values_list('method', flat=True).distinct()),
        }
        return respuesta
