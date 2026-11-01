from rest_framework import serializers

class TextAnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, allow_blank=False)


class DiagnosticoRequestSerializer(serializers.Serializer):
    ticket_id = serializers.IntegerField(min_value=1)


class PrediccionTextoSerializer(serializers.Serializer):
    texto = serializers.CharField(min_length=10, max_length=2000, trim_whitespace=True)
