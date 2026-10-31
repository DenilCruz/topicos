from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from modules.autenticacion.api.serializers import (
    LoginRequestSerializer,
    RegisterRequestSerializer,
    UserResponseSerializer,
    LoginResponseSerializer
)
from modules.autenticacion.services.auth_service import AuthService

class LoginView(APIView):
    """
    UC-BE-08: Autenticación y Emisión de Tokens JWT (/api/v1/auth/login)
    Valida credenciales contra la base de datos y retorna token JWT firmado con HMAC-SHA256,
    roles y expiración de 8 horas. Rechaza con HTTP 401 Unauthorized ante credenciales erróneas.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = AuthService()
        try:
            data = service.authenticate_and_generate_tokens(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
        except AuthenticationFailed as exc:
            error_message = str(exc.detail) if hasattr(exc, 'detail') else str(exc)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "AUTHENTICATION_FAILED",
                        "message": error_message
                    },
                    "detail": error_message
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Respuesta estructurada según UC-BE-08 y retrocompatible con la arquitectura cliente
        response_payload = {
            'token': data['token'],
            'type': data['type'],
            'username': data['username'],
            'roles': data['roles'],
            'success': True,
            'data': data,
            'user': data['user'],
            'tokens': data['tokens']
        }
        return Response(response_payload, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = AuthService()
        user_data = service.register_user(**serializer.validated_data)
        return Response({"success": True, "data": user_data}, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        raw_role = getattr(user, 'profile', None).role if hasattr(user, 'profile') else 'USER'
        role_claim = raw_role if raw_role.startswith('ROLE_') else f"ROLE_{raw_role}"
        roles_list = [role_claim]
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': raw_role,
            'roles': roles_list
        }
        return Response({"success": True, "data": data, **data}, status=status.HTTP_200_OK)
