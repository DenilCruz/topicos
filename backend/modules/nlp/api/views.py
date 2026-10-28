from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from modules.nlp.api.serializers import TextAnalysisRequestSerializer
from modules.nlp.services.nlp_service import NlpService

class AnalyzeTextView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TextAnalysisRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = NlpService()
        result = service.process_complete_analysis(text=serializer.validated_data['text'])
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)
