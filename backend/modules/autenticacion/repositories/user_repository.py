"""Repository layer for user data access."""
from django.contrib.auth.models import User
from typing import Optional
from modules.autenticacion.domain.models import UserProfile, RoleChoices

class UserRepository:
    """Encapsulates data queries and persistence for users and profiles."""
    
    @staticmethod
    def get_by_username(username: str) -> Optional[User]:
        return User.objects.filter(username=username).select_related('profile').first()

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        return User.objects.filter(id=user_id).select_related('profile').first()

    @staticmethod
    def create_user(username: str, email: str, password: str, role: str = RoleChoices.USER) -> User:
        user = User.objects.create_user(username=username, email=email, password=password)
        UserProfile.objects.create(user=user, role=role)
        return user
