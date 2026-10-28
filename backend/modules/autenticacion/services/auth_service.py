"""Service layer for authentication business use cases."""
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from core.exceptions import DomainException
from modules.autenticacion.repositories.user_repository import UserRepository
from typing import Dict, Any

class AuthService:
    """Manages authentication tokens, validation and user registration."""
    
    def __init__(self, user_repo: UserRepository = None):
        self.user_repo = user_repo or UserRepository()

    def authenticate_and_generate_tokens(self, username: str, password: str) -> Dict[str, Any]:
        user = authenticate(username=username, password=password)
        if not user or not user.is_active:
            raise DomainException("Credenciales inválidas o usuario inactivo.", code="INVALID_CREDENTIALS")

        refresh = RefreshToken.for_user(user)
        role = getattr(user, 'profile', None).role if hasattr(user, 'profile') else 'USER'

        return {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }

    def register_user(self, username: str, email: str, password: str, role: str) -> Dict[str, Any]:
        if self.user_repo.get_by_username(username):
            raise DomainException("El nombre de usuario ya está registrado.", code="USERNAME_TAKEN")

        user = self.user_repo.create_user(username, email, password, role)
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        }
