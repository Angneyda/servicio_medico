
# Importa la configuración de Django
from django.conf import settings
# Importa la función para autenticar usuarios de Django
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
# Importa utilidades de DB
# Importa utilidades y clases de DRF para manejar respuestas y permisos
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
# Importa serializers y tokens JWT para autenticación
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

# Importa serializers y modelos
from .models import UserPersona
from .serializers import (
    UserRegisterSerializer,
    UserPersonaCreateSerializer,
    UserPersonaDetailSerializer,
    UsuarioListaSerializer,
    UsuarioDetalleUpdateSerializer,
)
# --- Vista para registro de usuario ---
# Esta vista permite registrar un usuario y su persona asociada desde la API.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.generics import ListAPIView


# --- Aprendizaje: Vista para registro de usuario ---
# Esta vista permite registrar un usuario y su persona asociada desde la API.
class UsuarioRegistroView(APIView):
    # --- Aprendizaje: Solo administradores pueden registrar usuarios ---
    permission_classes = [AllowAny]  # [IsAdminUser] Solo administradores autenticados pueden acceder

    def post(self, request):
        # --- Aprendizaje: Recibe datos del usuario y persona ---
        serializer = UserRegisterSerializer(data=request.data)  # Instancia el serializer con los datos recibidos

        if serializer.is_valid():  # Valida los datos enviados
            user = serializer.save()  # Guarda el usuario y la persona en la base de datos
            return Response(
                {'detail': 'Usuario registrado correctamente.'},
                status=status.HTTP_201_CREATED
            )  # Devuelve mensaje de éxito

        # Si hay errores de validación, los devuelve al usuario
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

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

        # Autentica con el sistema estándar de Django
        django_user = authenticate(username=username, password=password)
        if django_user is not None:
            return self._build_token_response(django_user, source='django')

        # Si ninguna autenticación es válida, retorna error 401
        return Response(
            {'detail': 'Credenciales inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

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


class UserPersonaCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = UserPersonaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_persona = serializer.save()
        output = UserPersonaDetailSerializer(user_persona)
        return Response(output.data, status=status.HTTP_201_CREATED)


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

# Vista para obtener el listado de usuarios con su persona y rol (solo para administradores)
class UsuarioListaView(ListAPIView):
    """
    Endpoint solo-lectura para listar usuarios con su persona y rol.

    URL: GET /api/usuarios/listar/
    """

    permission_classes = [IsAdminUser]
    serializer_class = UsuarioListaSerializer

    def get_queryset(self):
        # Optimiza las consultas cargando user y persona en la misma query
        return (
            UserPersona.objects
            .select_related('user', 'persona')
            .all()
        )


class UsuarioDetalleUpdateView(APIView):
    """Permite obtener y actualizar datos combinados de User + Persona.

    URL base: /api/usuarios/editar/<pk>/
    """

    permission_classes = [IsAdminUser]

    def get_object(self, pk: int) -> UserPersona:
        return get_object_or_404(UserPersona, pk=pk)

    def get(self, request, pk: int):
        """
        Devuelve los datos necesarios para prellenar el formulario de edición.

        Aquí usamos el serializer en modo SOLO LECTURA:
        - instance = UserPersona
        - NO pasamos data, solo queremos representation (serializer.data)
        """
        # 1) Buscamos el vínculo UserPersona o devolvemos 404 si no existe
        user_persona = self.get_object(pk)

        # 2) Creamos el serializer PASÁNDOLE la instancia
        serializer = UsuarioDetalleUpdateSerializer(instance=user_persona)

        # 3) serializer.data llama internamente a to_representation()
        #    y devuelve el diccionario listo para el frontend
        return Response(serializer.data)

    def put(self, request, pk: int):
        """
        Actualiza datos de usuario y persona asociados al vínculo UserPersona.

        Aquí usamos el serializer en modo ESCRITURA:
        - instance = UserPersona (lo que vamos a editar)
        - data = request.data (lo que envía el frontend)
        """
        # 1) Obtenemos el vínculo UserPersona a editar
        user_persona = self.get_object(pk)

        # 2) Creamos el serializer con instancia + data
        serializer = UsuarioDetalleUpdateSerializer(
            instance=user_persona,
            data=request.data,
            partial=False,
        )

        # 3) Validar
        serializer.is_valid(raise_exception=True)

        # 4) Guardar cambios (llama a update)
        serializer.save()

        # 5) Respuesta
        return Response({'detail': 'Usuario/persona actualizados correctamente.'})  