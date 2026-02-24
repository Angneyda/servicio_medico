from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuarios


class UsuariosLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Debe proporcionar usuario y contraseña.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = (
            Usuarios.objects.filter(username=username).exclude(contrasena__isnull=True).first()
        )
        if usuario and self._password_matches(password, usuario.contrasena):
            return self._build_token_response(usuario, source='usuarios')

        django_user = authenticate(username=username, password=password)
        if django_user is not None:
            return self._build_token_response(django_user, source='django')

        return Response(
            {'detail': 'Credenciales inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    def _password_matches(self, raw_password: str, stored_password: str) -> bool:
        if not stored_password:
            return False
        hashed_algorithms = ('pbkdf2_', 'argon2', 'bcrypt', 'scrypt')
        if stored_password.startswith(hashed_algorithms):
            return check_password(raw_password, stored_password)
        return stored_password == raw_password

    def _build_token_response(self, user, source: str):
        refresh = RefreshToken.for_user(user)
        refresh['username'] = self._resolve_username(user)
        refresh['source'] = source

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': getattr(user, 'id', None),
                    'username': self._resolve_username(user),
                    'tipo_usuario': getattr(user, 'tipo_usuario', None),
                },
            }
        )

    def _resolve_username(self, user):
        username = getattr(user, 'username', None)
        if username:
            return username
        getter = getattr(user, 'get_username', None)
        return getter() if callable(getter) else ''
