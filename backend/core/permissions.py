from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """Allows access only to users with the Admin role or staff privileges."""
    def has_permission(self, request, view):
        user = request.user
        # El rol de negocio vive en UserProfile (user.profile.role)
        profile = getattr(user, 'profile', None)
        role = getattr(user, 'role', None) or getattr(profile, 'role', '')
        return bool(user and user.is_authenticated and (user.is_staff or role == 'ADMIN'))
