"""Service layer for authentication business use cases."""
from datetime import timedelta
from typing import Dict, Any, List
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from core.exceptions import DomainException
from modules.autenticacion.repositories.user_repository import UserRepository

class AuthService:
    """Manages authentication tokens, validation and user registration."""
    
    def __init__(self, user_repo: UserRepository = None):
        self.user_repo = user_repo or UserRepository()

    def authenticate_and_generate_tokens(self, username: str, password: str) -> Dict[str, Any]:
        """
        UC-BE-08: Autenticación y Emisión de Tokens JWT (/api/v1/auth/login)
        Valida credenciales contra la base de datos PostgreSQL/Django y genera un
        token JWT firmado digitalmente con clave secreta HMAC-SHA256 con fecha de
        expiración de 8 horas e inclusión de roles (RBAC).
        """
        user = authenticate(username=username, password=password)
        if not user or not user.is_active:
            raise AuthenticationFailed("Credenciales inválidas o usuario inactivo.")

        # Construcción del token JWT con expiración de 8 horas
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        access_token.set_exp(lifetime=timedelta(hours=8))

        # Determinar rol y formatear lista de roles (e.g. ['ROLE_ADMIN'])
        profile = getattr(user, 'profile', None)
        raw_role = profile.role if profile and profile.role else 'USER'
        role_claim = raw_role if raw_role.startswith('ROLE_') else f"ROLE_{raw_role}"
        roles_list: List[str] = [role_claim]

        # Incluir claims de roles y datos de usuario dentro del token JWT
        access_token['roles'] = roles_list
        access_token['role'] = raw_role
        access_token['username'] = user.username
        access_token['email'] = user.email

        token_str = str(access_token)
        refresh_str = str(refresh)

        return {
            # Especificación REST según caso de uso UC-BE-08
            'token': token_str,
            'type': 'Bearer',
            'username': user.username,
            'roles': roles_list,

            # Objetos para compatibilidad con cliente actual y capa frontend
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': raw_role,
                'roles': roles_list,
            },
            'tokens': {
                'access': token_str,
                'refresh': refresh_str,
            }
        }

    def register_user(self, username: str, email: str, password: str, role: str) -> Dict[str, Any]:
        if self.user_repo.get_by_username(username):
            raise DomainException("El nombre de usuario ya está registrado.", code="USERNAME_TAKEN")

        # Normalizar rol en caso de que venga con prefijo ROLE_
        clean_role = role[5:] if role.startswith('ROLE_') else role
        user = self.user_repo.create_user(username, email, password, clean_role)
        role_claim = clean_role if clean_role.startswith('ROLE_') else f"ROLE_{clean_role}"

        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': clean_role,
            'roles': [role_claim]
        }
