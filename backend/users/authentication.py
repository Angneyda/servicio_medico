from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Usuarios


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate using JWT tokens stored in cookies, with Bearer fallback."""

    def authenticate(self, request):
        cookie_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if cookie_token:
            validated_token = self.get_validated_token(cookie_token)
            return self.get_user(validated_token), validated_token
        return super().authenticate(request)


class UsuariosJWTAuthentication(CookieJWTAuthentication):
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
