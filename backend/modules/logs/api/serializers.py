from rest_framework import serializers
from modules.logs.domain.models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'timestamp',
            'user_identifier',
            'method',
            'path',
            'status_code',
            'duration_ms',
            'ip_address',
            'severity',
            'message'
        ]
