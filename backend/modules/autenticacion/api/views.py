from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from modules.autenticacion.api.serializers import LoginRequestSerializer, RegisterRequestSerializer, UserResponseSerializer
from modules.autenticacion.services.auth_service import AuthService

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = AuthService()
        data = service.authenticate_and_generate_tokens(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

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
        role = getattr(user, 'profile', None).role if hasattr(user, 'profile') else 'USER'
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        }
        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)
