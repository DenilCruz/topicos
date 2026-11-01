from rest_framework import serializers

class StartCaseRequestSerializer(serializers.Serializer):
    process_id = serializers.CharField(required=True)
    # Sin child: los contratos de Bonita aceptan números, booleanos y texto (p. ej. ticketId Long)
    contract_variables = serializers.DictField(required=False, default=dict)

class ExecuteTaskRequestSerializer(serializers.Serializer):
    task_id = serializers.CharField(required=True)
    task_variables = serializers.DictField(required=False, default=dict)
