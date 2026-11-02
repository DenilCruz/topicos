from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from core.exceptions import DomainException
from modules.tickets.domain.models import TicketEstado, TicketPrioridad
from modules.reports.services.report_service import (
    ExecutiveReportService, VoiceReportService, VOICE_QUERY_MAX_LENGTH, extraer_metricas,
    crear_cliente_ia,
)

def _parse_dias(request) -> int:
    try:
        dias = int(request.query_params.get('dias', 7))
    except ValueError:
        raise ValidationError({'dias': ['Debe ser un número entero.']})
    if not 1 <= dias <= 365:
        raise ValidationError({'dias': ['Debe estar entre 1 y 365.']})
    return dias


class ReportOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'estados': list(TicketEstado.values), 'prioridades': list(TicketPrioridad.values)})

class ExecutiveReportView(APIView):
    """
    GET /api/v1/reports/executive?dias=7
    Métricas de incidentes calculadas con el ORM y resumen ejecutivo redactado por DeepSeek.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        proveedor = request.query_params.get('proveedor', 'deepseek')
        if proveedor not in ('deepseek', 'groq'):
            raise ValidationError({'proveedor': ['Selecciona deepseek o groq.']})
        reporte = ExecutiveReportService(llm_client=crear_cliente_ia(proveedor)).generar_reporte(_parse_dias(request))
        reporte['proveedor'] = proveedor
        return Response(reporte, status=status.HTTP_200_OK)

class MetricsView(APIView):
    """
    GET /api/v1/reports/metrics?dias=7
    Solo las métricas del ORM (sin llamar al LLM), para el dashboard visual.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'metrics': extraer_metricas(_parse_dias(request))}, status=status.HTTP_200_OK)

class VoiceQuerySerializer(serializers.Serializer):
    texto = serializers.CharField(max_length=VOICE_QUERY_MAX_LENGTH, trim_whitespace=True)
    dias = serializers.IntegerField(min_value=1, max_value=365, default=7)
    proveedor = serializers.ChoiceField(choices=['deepseek', 'groq'], default='deepseek')

class VoiceReportView(APIView):
    """
    POST /api/v1/reports/voice  {"texto": "<consulta transcrita>", "dias": 7}
    Genera un reporte en Markdown que responde a la consulta hablada, usando solo las métricas del sistema.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VoiceQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            proveedor = serializer.validated_data['proveedor']
            cliente = crear_cliente_ia(proveedor)
            data = VoiceReportService(llm_client=cliente).generar_desde_voz(
                serializer.validated_data['texto'], serializer.validated_data['dias'],
            )
            data['proveedor'] = proveedor
            data['modelo'] = cliente.model
        except DomainException as e:
            # Fallo del proveedor LLM: 503 para distinguirlo de un error de validación
            return Response(
                {'success': False, 'error': {'code': e.code, 'message': e.message}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(data, status=status.HTTP_200_OK)
