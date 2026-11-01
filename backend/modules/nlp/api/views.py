from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from modules.nlp.api.serializers import TextAnalysisRequestSerializer, DiagnosticoRequestSerializer
from modules.nlp.services.diagnostico_service import diagnosticar_ticket
from modules.nlp.api.serializers import PrediccionTextoSerializer
from modules.nlp.adapters.modelo_entrenado import cargar_pipeline, predecir_diagnostico, ModeloNoDisponible
from django.conf import settings
from src.nlp.explicacion import explicar_pipeline_entrenado
from modules.nlp.services.nlp_service import NlpService

class AnalyzeTextView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TextAnalysisRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = NlpService()
        result = service.process_complete_analysis(text=serializer.validated_data['text'])
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class DiagnosticarTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        entrada = DiagnosticoRequestSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        resultado = diagnosticar_ticket(ticket_id=entrada.validated_data['ticket_id'], request=request)
        return Response({'success': True, 'data': resultado})


class PredecirTextoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        entrada = PrediccionTextoSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        texto = entrada.validated_data['texto']
        pipeline = cargar_pipeline(str(settings.NLP_PIPELINE_PATH))
        diagnostico = predecir_diagnostico(texto, pipeline)
        try:
            pasos = explicar_pipeline_entrenado(pipeline, texto)
        except Exception as error:
            raise ModeloNoDisponible('No se pudo obtener el desglose del pipeline configurado.') from error
        return Response({'success': True, 'data': {**diagnostico, 'preprocesamiento': pasos}})
