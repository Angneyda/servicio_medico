# Documentación RBAC (Roles y Permisos) — Sismed

Fecha: 06/03/2026

Resumen
- Se implementó un sistema RBAC usando los modelos nativos de Django: `Group` (roles) y `Permission`.
- Se añadieron endpoints en el backend (Django REST Framework) para listar/crear/editar roles y permisos, y para asignar roles a usuarios.
- En el frontend (Next.js) se añadieron páginas y modales para gestionar roles y permisos, además de hooks y contexto de autenticación que exponen `groups` y helpers.

Contenido de esta documentación
- Backend: archivos y funciones relevantes.
- Frontend: archivos y componentes relevantes.
- Endpoints API disponibles (rutas y métodos).
- Cómo probar localmente.
- Mejoras sugeridas.

---

## Backend (Django)
Rutas: `backend/users/` (app `users`)

Archivos y funciones principales:

- `backend/users/serializers.py`
  - `PermissionSerializer` — serializa `Permission`. Ajustes: `content_type` como `PrimaryKeyRelatedField` (sin `source` redundante); `create()` suministra `content_type` por defecto si no se proporciona.
  - `GroupSerializer` — serializa `Group` con campos `permissions` (lectura) y `permission_ids` (escritura). Implementa `create()` y `update()` para aplicar permisos.
  - `UserGroupsSerializer` — serializer simple para asignar grupos a un `UserPersona` (campo `group_ids`).
  - Otros serializers relacionados con `UserPersona` (listado y edición de usuarios vinculados a `Personas`).

- `backend/users/views.py`
  - `GroupListView` (ListCreateAPIView): mostrar y crear `Group`.
  - `GroupDetailView` (RetrieveUpdateDestroyAPIView): ver/editar/borrar un `Group`.
  - `PermissionListView` / `PermissionDetailView` (similares, si existen): listar y gestionar `Permission`.
  - `AssignRolesView` (APIView): `POST /api/usuarios/roles/assign/<pk>/` — asigna una lista de grupos a un `UserPersona`.
  - Ajustes en `MeView` y `UsuarioDetalle` para exponer `groups` y `group_ids` cuando corresponde.

- `backend/users/permissions.py`
  - `RoutePermission` (PermissionClass de DRF): lógica para derivar un `codename` de permiso a partir de la ruta o de `view.required_permission`. Verifica existencia del `Permission` y usa `user.has_perm()` o permite acceso a staff/superuser si el permiso no existe (fallback).

- `backend/users/urls.py`
  - Rutas registradas (ejemplos):
    - `path('roles/', GroupListView.as_view(), name='roles_list_create')`
    - `path('roles/<int:pk>/', GroupDetailView.as_view(), name='roles_detail')`
    - `path('roles/assign/<int:pk>/', AssignRolesView.as_view(), name='roles_assign')`
    - `path('permissions/', PermissionListView.as_view(), name='permissions_list_create')`
    - `path('permissions/<int:pk>/', PermissionDetailView.as_view(), name='permissions_detail')`

Notas backend
- Uso de modelos nativos `django.contrib.auth.models.Group` y `Permission`.
- Serializers manejan relaciones muchos-a-muchos para permisos (lectura anidada y escritura mediante `permission_ids`).
- Se corrigió un bug que producía 500: `PermissionSerializer` definía `content_type` con `source='content_type'` redundante; se eliminó `source`.

---

## Frontend (Next.js + TypeScript)
Ubicación: `frontend-next/src/`

Archivos y componentes principales:

- Hooks:
  - `src/hooks/usePermissions.ts` — obtiene la lista de permisos desde `GET /api/usuarios/permissions/` y expone `permissions`, `loading`, `error`, `setPermissions`.
  - `src/hooks/useRoles.ts` — obtiene roles desde `GET /api/usuarios/roles/`.

- Contexto / Auth:
  - `src/context/AuthContext.tsx` — expone usuario autenticado (`me`), `groups` y helpers `hasRole`, `hasAnyRole`, y `hasPermission` (si implementado).

- Páginas:
  - `src/app/(dashboard)/roles/page.tsx` — página de Roles: listado de roles, formulario simplificado para crear rol (solo nombre) y botón `Editar` por rol.
  - `src/app/(dashboard)/permissions/page.tsx` — página de Permisos (listar/crear/borrar permisos).

### Cómo usar `http://localhost:3000/permissions`
Esta pantalla sirve para **ver, crear y borrar permisos** de Django (`auth.Permission`). En este proyecto los permisos se usan, entre otras cosas, para proteger rutas usando `RoutePermission` en el backend.

#### Listado
- Muestra los permisos existentes con `ID`, `codename` y `name`.
- Puedes borrar un permiso con el botón **Eliminar** (hace `DELETE /api/usuarios/permissions/<id>/`).

#### Formulario “Crear permiso (opcional: mapear ruta)”
Campos:
- **Nombre legible** (`name`) — obligatorio. Es el texto que verás en la UI.
- **Codename (opcional)** (`codename`) — si lo llenas, se usa tal cual.
- **Ruta (opcional)** (`route`) — si no llenas `codename` pero sí `route`, se genera automáticamente un `codename`.

Regla de validación en la UI:
- Para crear, se requiere `name` y **al menos uno** entre `codename` o `route`.

Lógica de creación:
- Al presionar **Crear**, el frontend hace `POST /api/usuarios/permissions/` con:
  - `name`
  - `codename` (el que escribiste, o el generado desde la ruta)
- El backend asigna `content_type` por defecto si no se envía.

Generación de `codename` a partir de `route` (alineado con el backend):
- Se quita el `/` inicial si existe.
- Se eliminan query params (`?x=...`).
- Se reemplaza `/` por `_`.
- Se eliminan caracteres que no sean letras/números/`_`.
- Se colapsan múltiples `_` y se recortan `_` al inicio/fin.
- Se antepone el prefijo `access_`.

Ejemplos:
- `route` = `/users` → `codename` = `access_users`
- `route` = `/users/123/edit` → `codename` = `access_users_123_edit`
- `route` = `/users/[id]/edit` → `codename` = `access_users_id_edit` (se eliminan `[` y `]`)
- `route` vacía (o solo `/`) → `codename` = `access_root`

Nota importante:
- Para que `RoutePermission` funcione, el `codename` que crees debe coincidir con el que el backend derivará desde la ruta real del request.

- Componentes / Modales:
  - `src/components/Modals/EditRoleModal.tsx` — modal mejorado para editar un rol:
    - Carga permisos y datos del rol al abrir.
    - Búsqueda por texto sobre `codename`.
    - Agrupa permisos por modelo derivado del `codename` (p.ej. `add_logentry` → grupo `logentry`).
    - Botones `Seleccionar todo` / `Deseleccionar` por grupo.
    - Guarda con `PUT /api/usuarios/roles/<id>/` enviando `permission_ids`.
  - `src/components/Modals/AssignRolesModal.tsx` — modal para asignar roles a un usuario (cuando corresponde).

- Página `roles` cambios UX
  - Se ocultó la lista masiva de permisos del formulario de creación (porque saturaba la UI).
  - Ahora la creación de rol solo pide nombre; los permisos se asignan desde el modal `Editar` (más claro y ordenado).

---

## Endpoints API (resumen)
- GET  /api/usuarios/roles/                -> listar roles (Group)
- POST /api/usuarios/roles/                -> crear rol (body: { name })
- GET  /api/usuarios/roles/<id>/           -> ver rol (incluye permisos anidados)
- PUT  /api/usuarios/roles/<id>/           -> actualizar rol (body: { name, permission_ids: [1,2] })
- DELETE /api/usuarios/roles/<id>/         -> borrar rol
- POST /api/usuarios/roles/assign/<pk>/    -> asignar grupos a `UserPersona` (body: { group_ids: [...] })

- GET  /api/usuarios/permissions/          -> listar permissions
- POST /api/usuarios/permissions/          -> crear permission (body: { codename, name, content_type })
- GET  /api/usuarios/permissions/<id>/     -> ver permission
- DELETE /api/usuarios/permissions/<id>/   -> borrar permission

Notas: autenticación y permisos están controlados por DRF permission classes; algunos endpoints requieren `IsAdminUser` o `RoutePermission`.

---

## Cómo probar localmente
1. Backend: activar virtualenv y correr servidor Django

```bash
source env/bin/activate
cd backend
python manage.py runserver
```

2. Frontend: arrancar Next dev server (en `frontend-next`)

```bash
cd frontend-next
pnpm install   # o `npm install` / `yarn`
pnpm dev
```

3. Abrir en el navegador: `http://localhost:3000/roles` y usar "Editar" en un rol para ver el nuevo modal con búsqueda y agrupado. Para comprobar API directamente usar curl o Postman en las rutas arriba listadas.

Pruebas rápidas hechas por el equipo:
- Se reparó el error 500 provocado por el serializer de permisos y verificado con llamadas de prueba usando `APIRequestFactory` + `force_authenticate` en `manage.py shell`.
- Verificado que `GET /api/usuarios/roles/` y `GET /api/usuarios/permissions/` devuelven 200 y JSON.

---

## Mejoras sugeridas (futuro)
- En backend: devolver `content_type.app_label` y `content_type.model` en `PermissionSerializer` para mostrar títulos de grupo más amigables (p.ej. "Agenda — Agenda").
- UI: mostrar encabezados por app/model en lugar de derivar por `codename` (más preciso). Requiere exponer `content_type` con `app_label` y `model` desde la API.
- Añadir tests unitarios e integración para endpoints RBAC (DRF APITestCase).
- Agregar paginación y búsqueda server-side si la lista de permisos crece mucho.

---

Si quieres, puedo:
- Generar `docs/RBAC.md` (ya creado) con ejemplos de payloads para cada endpoint.
- Implementar el cambio backend para exponer `content_type` legible y actualizar el modal para agrupar por `app_label.model`.
- Añadir tests automáticos para los endpoints críticos.


---

Archivo creado: `docs/RBAC.md`
