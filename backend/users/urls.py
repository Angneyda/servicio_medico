"""
Archivo de rutas (urls.py) de la app users.
Aquí defines SOLO las rutas relacionadas con usuarios y personas.
Estas rutas se incluirán en el urls.py principal del proyecto.
"""

from django.urls import path
# Importa las vistas que se usarán en las rutas
from .views import (
    UsuarioRegistroView,         # Vista para registrar usuario y persona
    UsuariosLoginView,           # Vista para login
    CookieTokenRefreshView,      # Vista para refrescar token JWT
    LogoutView,                  # Vista para logout
    MeView,                      # Vista para obtener datos del usuario autenticado
    UserPersonaCreateView,       # Vista para crear usuario-persona (ejemplo adicional)
    UsuarioListaView,            # Vista para listar usuarios con su persona y rol (solo para administradores)
    UsuarioDetalleUpdateView,    # Vista para ver/actualizar un usuario-persona concreto
    UsuarioDeleteView,           # Vista para eliminar usuario-persona
    # RBAC
    GroupListView,
    GroupDetailView,
    AssignRolesView,
    PermissionListView,
    PermissionDetailView,
)

# Lista de rutas específicas de la app users
urlpatterns = [
    # POST /api/usuarios/registro/ -> Registrar usuario y persona
    path('registro/', UsuarioRegistroView.as_view(), name='usuario_registro'),

    # POST /api/usuarios/login/ -> Login de usuario
    path('login/', UsuariosLoginView.as_view(), name='usuarios_login'),

    # POST /api/usuarios/refresh/ -> Refrescar token JWT
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh_cookie'),

    # POST /api/usuarios/logout/ -> Cerrar sesión
    path('logout/', LogoutView.as_view(), name='logout'),

    # GET /api/usuarios/me/ -> Obtener datos del usuario autenticado
    path('me/', MeView.as_view(), name='auth_me'),

    # POST /api/usuarios/crear/ -> Crear usuario-persona (ejemplo adicional)
    path('crear/', UserPersonaCreateView.as_view(), name='user_persona_create'),
    
    # GET /api/usuarios/listar/ -> Lista usuarios con persona y rol
    path('listar/', UsuarioListaView.as_view(), name='usuarios_listar'),

    # GET/PUT /api/usuarios/editar/<pk>/ -> Detalle + actualización de usuario/persona
    path('editar/<int:pk>/', UsuarioDetalleUpdateView.as_view(), name='usuarios_detalle_editar'),

    # DELETE /api/usuarios/eliminar/<pk>/ -> Eliminar usuario y persona asociados
    path('eliminar/<int:pk>/', UsuarioDeleteView.as_view(), name='usuarios_eliminar'),
    # ---------------- RBAC: Roles y Permisos ----------------
    # GET/POST /api/usuarios/roles/ -> Listar o crear roles (Group)
    path('roles/', GroupListView.as_view(), name='roles_list_create'),
    # GET/PUT/DELETE /api/usuarios/roles/<pk>/ -> Detalle de rol
    path('roles/<int:pk>/', GroupDetailView.as_view(), name='roles_detail'),
    # POST /api/usuarios/roles/assign/<pk>/ -> Asignar roles al UserPersona (pk = id de UserPersona)
    path('roles/assign/<int:pk>/', AssignRolesView.as_view(), name='roles_assign'),
    # GET/POST /api/usuarios/permissions/ -> Listar o crear permisos
    path('permissions/', PermissionListView.as_view(), name='permissions_list_create'),
    # GET/PUT/DELETE /api/usuarios/permissions/<pk>/ -> Detalle de permiso
    path('permissions/<int:pk>/', PermissionDetailView.as_view(), name='permissions_detail'),
]

