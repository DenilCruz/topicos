from modules.tickets.domain.models import Usuario

def resolver_usuario_negocio(auth_user) -> Usuario:
    """
    Devuelve la fila de la tabla usuarios asociada al usuario autenticado (auth_user),
    enlazándolas por username y creándola si aún no existe.
    """
    profile = getattr(auth_user, 'profile', None)
    rol = profile.role if profile else 'USER'
    usuario, _ = Usuario.objects.get_or_create(
        username=auth_user.username,
        defaults={'password': auth_user.password, 'roles': f'ROLE_{rol}'},
    )
    return usuario
