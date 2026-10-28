from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """Allows access only to users with the Admin role or staff privileges."""
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or getattr(request.user, 'role', '') == 'ADMIN'))
