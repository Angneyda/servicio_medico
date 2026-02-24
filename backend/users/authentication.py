from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Usuarios


class UsuariosJWTAuthentication(JWTAuthentication):
    """Allow JWT tokens issued for Usuarios table to authenticate via DRF."""

    def get_user(self, validated_token):
        source = validated_token.get('source')
        if source == 'usuarios':
            user_id = validated_token.get('user_id')
            if user_id is None:
                raise InvalidToken('Token sin identificador de usuario.')

            try:
                return Usuarios.objects.get(pk=user_id)
            except Usuarios.DoesNotExist as exc:  # pragma: no cover
                raise InvalidToken('Usuario no encontrado.') from exc

        # Defer to default Django user behavior for other tokens
        return super().get_user(validated_token)
