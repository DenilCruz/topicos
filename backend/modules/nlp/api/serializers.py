from rest_framework import serializers

class TextAnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, allow_blank=False)
