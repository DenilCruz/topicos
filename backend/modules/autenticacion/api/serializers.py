from rest_framework import serializers

class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class LoginResponseSerializer(serializers.Serializer):
    """Estructura de respuesta REST según UC-BE-08."""
    token = serializers.CharField()
    type = serializers.CharField(default='Bearer')
    username = serializers.CharField()
    roles = serializers.ListField(child=serializers.CharField())

class RegisterRequestSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    role = serializers.CharField(default='USER')

class UserResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    roles = serializers.ListField(child=serializers.CharField(), required=False)
