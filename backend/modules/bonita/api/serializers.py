from rest_framework import serializers

class StartCaseRequestSerializer(serializers.Serializer):
    process_id = serializers.CharField(required=True)
    contract_variables = serializers.DictField(child=serializers.CharField(), required=False, default=dict)

class ExecuteTaskRequestSerializer(serializers.Serializer):
    task_id = serializers.CharField(required=True)
    task_variables = serializers.DictField(child=serializers.CharField(), required=False, default=dict)
