
# Importa la configuración de Django
from django.conf import settings
# Importa la función para autenticar usuarios de Django
from django.contrib.auth import authenticate
# Importa la función para verificar contraseñas hasheadas
from django.contrib.auth.hashers import check_password
# Importa utilidades y clases de DRF para manejar respuestas y permisos
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
# Importa serializers y tokens JWT para autenticación
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

# Importa el modelo de usuarios personalizado
from .models import Usuarios

# Vista para el login de usuarios
class UsuariosLoginView(APIView):
    # Permite que cualquier usuario (autenticado o no) acceda a esta vista
    permission_classes = [AllowAny]

    # Método que maneja las peticiones POST (inicio de sesión)
    def post(self, request):
        # Obtiene el nombre de usuario y contraseña del cuerpo de la petición
        username = request.data.get('username')
        password = request.data.get('password')

        # Si falta usuario o contraseña, retorna error 400
        if not username or not password:
            return Response(
                {'detail': 'Debe proporcionar usuario y contraseña.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Busca el usuario en el modelo personalizado y verifica que tenga contraseña
        usuario = (
            Usuarios.objects.filter(username=username).exclude(contrasena__isnull=True).first()
        )
        # Si existe y la contraseña coincide, retorna los tokens y datos del usuario
        if usuario and self._password_matches(password, usuario.contrasena):
            return self._build_token_response(usuario, source='usuarios')

        # Si no, intenta autenticar con el sistema estándar de Django
        django_user = authenticate(username=username, password=password)
        if django_user is not None:
            return self._build_token_response(django_user, source='django')

        # Si ninguna autenticación es válida, retorna error 401
        return Response(
            {'detail': 'Credenciales inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Método auxiliar para comparar contraseñas (soporta hasheadas y texto plano)
    def _password_matches(self, raw_password: str, stored_password: str) -> bool:
        if not stored_password:
            return False
        # Algoritmos de hash soportados
        hashed_algorithms = ('pbkdf2_', 'argon2', 'bcrypt', 'scrypt')
        # Si la contraseña almacenada está hasheada, usa check_password
        if stored_password.startswith(hashed_algorithms):
            return check_password(raw_password, stored_password)
        # Si no, compara como texto plano
        return stored_password == raw_password

    # Método auxiliar para construir la respuesta con los tokens y datos del usuario
    def _build_token_response(self, user, source: str):
        # Genera un token de refresco para el usuario
        refresh = RefreshToken.for_user(user)
        # Agrega información adicional al token
        refresh['username'] = self._resolve_username(user)
        refresh['source'] = source

        # Retorna la respuesta con datos básicos del usuario (sin exponer tokens)
        response = Response(
            {
                'user': {
                    'id': getattr(user, 'id', None), # ID del usuario
                    'username': self._resolve_username(user), # Nombre de usuario
                    'tipo_usuario': getattr(user, 'tipo_usuario', None), # Tipo de usuario (si existe)
                },
            }
        )
        # Adjunta los tokens en cookies httpOnly
        self._set_auth_cookies(response, refresh)
        return response

    # Método auxiliar para obtener el username del usuario
    def _resolve_username(self, user):
        username = getattr(user, 'username', None)
        if username:
            return username
        # Si no existe el atributo, intenta llamar a get_username()
        getter = getattr(user, 'get_username', None)
        return getter() if callable(getter) else ''

    # Método auxiliar para configurar las cookies de acceso y refresh
    def _set_auth_cookies(self, response: Response, refresh: RefreshToken) -> None:
        access_token = refresh.access_token
        access_max_age = int(access_token.lifetime.total_seconds())
        refresh_max_age = int(refresh.lifetime.total_seconds())

        response.set_cookie(
            settings.AUTH_COOKIE_NAME,
            str(access_token),
            max_age=access_max_age,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path='/',
        )
        response.set_cookie(
            settings.AUTH_REFRESH_COOKIE_NAME,
            str(refresh),
            max_age=refresh_max_age,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path='/',
        )


# Vista para refrescar tokens usando cookies
class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token no encontrado.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                {'detail': 'Refresh token inválido.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access = serializer.validated_data.get('access')
        new_refresh = serializer.validated_data.get('refresh', refresh_token)

        response = Response({'detail': 'Token actualizado.'})
        access_max_age = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
        refresh_max_age = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())

        response.set_cookie(
            settings.AUTH_COOKIE_NAME,
            access,
            max_age=access_max_age,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path='/',
        )
        response.set_cookie(
            settings.AUTH_REFRESH_COOKIE_NAME,
            new_refresh,
            max_age=refresh_max_age,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path='/',
        )
        return response


# Vista para cerrar sesión
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response({'detail': 'Sesión cerrada.'})
        response.delete_cookie(settings.AUTH_COOKIE_NAME, path='/')
        response.delete_cookie(settings.AUTH_REFRESH_COOKIE_NAME, path='/')
        return response


# Vista para obtener el usuario autenticado
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                'id': getattr(user, 'id', None),
                'username': getattr(user, 'username', None) or '',
                'tipo_usuario': getattr(user, 'tipo_usuario', None),
            }
        )
