# Registro de Progreso del Proyecto SISMED

**Última Actualización:** 9 de Marzo de 2026

## Resumen (09/Mar/2026)

### Qué se hizo hoy
- Implementación de **RBAC (Roles y Permisos)** end-to-end:
    - Backend: endpoints para `roles` (Group) y `permissions` (Permission), y endpoint para asignación de roles a usuarios.
    - Backend: `Me` y detalle/edición de usuarios ahora exponen `groups`/`group_ids` para facilitar la UI.
    - Frontend: páginas `/roles` y `/permissions`, hooks (`useRoles`, `usePermissions`) y helpers en `AuthContext` (`hasRole`, `hasAnyRole`).
    - Frontend: modales para editar permisos por rol y asignar roles desde la lista de usuarios.
- Documentación técnica RBAC consolidada en `docs/RBAC.md`.

### Qué queda pendiente (prioridad)
- Pruebas automatizadas (backend RBAC + rutas críticas del backend y frontend).
- Endurecer el control de acceso: aplicar permisos finos por ruta (DRF `PermissionClasses`/middleware) y eliminar “fallbacks” amplios donde no apliquen.
- UI: edición individual de permisos (más allá de crear/listar/borrar) y mejor agrupación/visualización por `content_type`.
- Docs: corregir detalle de formato Markdown en `docs/RBAC.md` (cierre de bloque ``` al final).
- Revisar CORS/orígenes permitidos y endurecer cookies (`Secure`) al pasar a producción con HTTPS.

## 1. Refactorización de Arquitectura (Backend)
Se ha completado la migración de un modelo monolítico a una arquitectura modular basada en aplicaciones Django, alineada con esquemas de base de datos PostgreSQL.

### Aplicaciones Creadas
Se dividió `core/models.py` en 6 nuevas aplicaciones independientes:

1.  **users**: Gestión de usuarios, personas y familiares.
2.  **organization**: Estructura organizativa (Gerencias, Divisiones, Coordinaciones).
3.  **medical_staff**: Personal médico y especialidades.
4.  **appointments**: Gestión de citas, agenda médica y referencias.
5.  **medical_history**: Historias médicas, antecedentes y laboratorios.
6.  **inventory**: Farmacia, medicamentos e insumos.

### Configuración de Base de Datos
- **Motor**: Se cambió de SQLite a **PostgreSQL**.
- **Esquemas**: Se configuraron los modelos con `managed = False` y `db_table = '"esquema"."tabla"'` para mapear directamente a los esquemas creados en PostgreSQL.
- **Conexión**: Verificada exitosamente con las credenciales locales.

## 2. Desarrollo del Backend (API)
Se ha iniciado la construcción de la API REST para la comunicación con el Frontend.

- [x] **Dependencias**: Instalados `djangorestframework`, `django-cors-headers` y `djangorestframework-simplejwt`.
- [x] **Configuración**: 
    - Habilitado CORS y `Allow-Credentials` para envío de cookies desde `localhost:3000`/`5173`.
    - Configuración de Simple JWT con rotación de refresh y blacklist.
    - Autenticación por cookie httpOnly con respaldo Bearer.
- [x] **Endpoints Creados**:
    - `/api/auth/login/`: Login con cookies httpOnly (sin exponer tokens en JSON).
    - `/api/auth/refresh/`: Refresh por cookie con rotación.
    - `/api/auth/logout/`: Logout con blacklist y borrado de cookies.
    - `/api/auth/me/`: Perfil del usuario autenticado.
    - `/api/usuarios/listar/`: Listado combinado de usuarios (User + Personas + primer Group como rol) solo para administradores.
    - `/api/medical_staff/`: CRUD para doctores y personal médico.
    - `/api/medical_history/`: CRUD para historias médicas.
- [x] **Serializers y Vistas**: Implementados ViewSets básicos para `Doctores` e `HistoriaMedica` utilizando sus nombres reales.
- [x] **Migraciones**: Aplicadas migraciones de `token_blacklist`.
- [x] **Usuarios + Personas**: Implementada relación 1:1 entre usuario Django y `personas` mediante tabla `user_personas`.
- [x] **Endpoint creación**: Agregado `POST /api/users/` para crear usuario y persona en una sola operación.

### [27/Feb/2026] Endpoint de Registro de Usuario + Persona

- [x] **Endpoint creado:** `POST /api/usuarios/registro/`
    - Permite registrar un usuario y su persona asociada en una sola operación.
    - Solo accesible para administradores autenticados.
- [x] **Datos esperados:**
```json
{
  "username": "usuario_prueba",
  "email": "correo@ejemplo.com",
  "password": "clave_segura",
  "cedula": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "sexo": "M",
  "fecha_nacimiento": "1990-01-01",
  "correo": "correo@ejemplo.com",
  "telefono": "04141234567",
  "tipo_persona": 1,
  "estatus": 1
}
```
- [x] **Validaciones importantes:**
    - El campo `estatus` debe ser un número (IntegerField en el modelo).
    - Si se envía texto en `estatus`, retorna error 500.
    - Si el username ya existe, retorna error de validación.
- [x] **Prueba exitosa:**
    - Probado en Postman, respuesta: `{ "detail": "Usuario registrado correctamente." }`

### [03/Mar/2026] Gestión de Usuarios (Listado + Registro desde el Frontend)

- [x] **Listado de usuarios (backend):**
    - Serializador `UsuarioListaSerializer` que combina datos de `User`, `Personas` y el primer `Group` como rol.
    - Vista `UsuarioListaView` (`GET /api/usuarios/listar/`) protegida con `IsAdminUser` y usando `select_related` para optimizar consultas.
- [x] **Pantalla de listado `/users` (frontend):**
    - Hook `useUsers` que consume `/api/usuarios/listar/` y maneja estados de carga y error.
    - Componente `UsersTable` que muestra cédula, nombre, apellido, rol y botones de acción (Editar/Borrar, aún sin lógica).
    - Botón "Nuevo usuario" que navega a `/users/new`.
- [x] **Formulario de nuevo usuario `/users/new`:**
    - Formulario en Next.js que envía al endpoint `POST /api/usuarios/registro/`.
    - Campos: `username`, `email`, `password`, `cedula`, `nombre`, `apellido`, `sexo` (select `M`/`F`), `fecha_nacimiento`, `telefono`, `tipo_persona` (1=Personal, 2=Jubilado, 3=Familiar, 4=Cortesía), `estatus` (1=Activo, 2=Inactivo).
    - El valor de `email` se reutiliza como `Personas.correo` en el backend para evitar duplicar inputs.
    - `tipo_persona` y `estatus` se validan con `ChoiceField` y se convierten a enteros antes de guardar.
- [x] **Flujo de éxito y feedback al usuario:**
    - Tras un registro exitoso, el frontend redirige a `/users?created=1`.
    - La pantalla `/users` detecta ese parámetro y muestra un mensaje verde "Usuario registrado correctamente", con botón para cerrarlo y auto-ocultado tras unos segundos.

### [04/Mar/2026] Gestión de Usuarios (Edición + Feedback de actualización)

- [x] **Endpoint de detalle/edición (backend):**
    - Creado endpoint protegido `GET/PUT /api/usuarios/editar/<id>/` que trabaja sobre la relación `UserPersona`.
    - Implementado `UsuarioDetalleUpdateSerializer` que combina datos de `User` y `Personas` en un solo JSON plano (username, email, cédula, nombre, apellido, sexo, fecha_nacimiento, teléfono, tipo_persona, estatus).
    - La actualización sincroniza `User.email` y `Personas.correo` usando un único campo de correo proveniente del frontend.
    - Restringido a administradores (`IsAdminUser`) y probado vía Postman (login, GET de detalle, PUT de actualización y verificación con nuevo GET).
- [x] **Flujo de edición de usuarios (frontend):**
    - Botón **Editar** en la tabla de usuarios ahora navega a `/users/[id]/edit` usando el `id` de `UserPersona`.
    - Página dinámica `/users/[id]/edit` implementada como componente cliente que:
        - Obtiene el `id` de la URL con `useParams` (App Router de Next.js).
        - Carga los datos desde `/api/usuarios/editar/<id>/` y rellena un formulario similar al de "Nuevo usuario" (sin password).
        - Envía los cambios con `PUT /api/usuarios/editar/<id>/` y, si todo va bien, redirige a `/users?updated=1`.
- [x] **Mensaje de éxito al actualizar:**
    - La pantalla `/users` ahora detecta tanto `?created=1` como `?updated=1`.
    - Muestra un mensaje verde:
        - "Usuario registrado correctamente." cuando `created=1`.
        - "Usuario actualizado correctamente." cuando `updated=1`.
    - El mensaje se puede cerrar manualmente y se oculta automáticamente a los pocos segundos.

## 3. Desarrollo del Frontend (Next.js)
Se ha integrado la plantilla **TailAdmin (Next.js + TypeScript)** y configurado el sistema base.

- [x] **Estructura**: Organizado el proyecto en carpetas `services`, `context`, `hooks`, `components`, `pages`.
- [x] **Autenticación (JWT con cookies)**:
    - `AuthContext` actualizado para cargar usuario desde `/api/auth/me/`.
    - `axios` configurado con `withCredentials: true` y refresh automático vía `/api/auth/refresh/`.
    - Eliminado almacenamiento de tokens en `localStorage`.
    - Login actualizado para usar cookies httpOnly.
- [x] **Login y Navegación**:
    - Pantalla de Login (`SignIn.tsx`) funcional conectada con la API de Django.
    - Redirección automática al Dashboard tras el login.
    - Botón de **Log Out** completamente funcional en el Header.
- [x] **Componentes UI**:
    - Sidebar y Header configurados dinámicamente.
    - Creados hooks personalizados `useMedicalStaff` y `useMedicalHistory`.
    - Creado componente base `MedicalHistoryTable` (pendiente de probar con datos).
- [x] **Pantalla Usuarios**: Creada pantalla `/users` para crear usuario+persona desde el frontend.

## 4. Gestión del Proyecto (Git)
- Se inicializó el repositorio Git y se conectó con GitLab.
- Se configuró `.gitignore` para excluir archivos innecesarios (`env/`, `pycache`, bd local).
- Se creó una rama de desarrollo `feature/frontend-init` para trabajar el frontend sin afectar `main`.

## 5. Seguridad Aplicada (Docs y Checklist)
- [x] Documento de justificación guardado en `docs/medidas-seguridad-sismed.md`.
- [x] Checklist de verificación y pruebas con `curl` agregadas.

## 6. Próximos Pasos Pendientes
- [x] **Listado Usuarios**: Mostrar usuarios con su persona vinculada en la pantalla de Usuarios (completado para administradores; pendiente solo implementar acción de Borrar).
- [x] **Borrado de usuarios**: Implementar endpoint y lógica para eliminar usuarios/personas desde la API y conectar el botón "Borrar" en el frontend.
- [ ] **RBAC (Roles y Permisos)**: Completar el enforcement (permisos finos por ruta), pruebas y pulido de UI.
- [ ] **Consumo de Datos**: Crear páginas específicas ("Staff Médico", "Historias") en el frontend que usen los hooks creados para mostrar datos reales.
- [ ] **Formularios de Creación**: Implementar formularios para agregar pacientes y citas médicas.
- [ ] **Control de UI por rol**: Diferenciar interfaces entre Admin, Doctores y Pacientes (rutas/menús/acciones) según grupos y permisos.
- [ ] **HTTPS en Producción**: Configurar certificados reales y activar `Secure` en cookies.
- [ ] **Revisión de CORS**: Ajustar orígenes permitidos según dominio final del frontend.

### [06/Mar/2026] Implementación RBAC (Avance)

- [x] **Backend:** Endpoints añadidos para `roles` (Group) y `permissions` (Permission). Endpoint `POST /api/usuarios/roles/assign/<id>/` para asignar grupos a un `UserPersona`.
- [x] **Backend:** `GET /api/usuarios/me/` y `GET /api/usuarios/editar/<id>/` ahora incluyen `groups`/`group_ids` para facilitar controles de UI.
- [x] **Frontend:** `AuthContext` expone `groups`, `hasRole()` y `hasAnyRole()`.
- [x] **Frontend:** Página `/roles` añadida con creación y edición de roles, edición masiva de permisos por rol (modal), y botón "Editar" por rol.
- [x] **Frontend:** Modal para asignar roles desde la lista de usuarios (`UsersTable`) disponible en `/users`.
- [x] **Frontend:** Página `/permissions` añadida para crear permisos y mapear rutas a `codename`, con listado y eliminación de permisos.

**Notas:**
- La creación de permisos mapea la ruta a un `codename` cuando se proporciona; el backend usa `content_type` por defecto si no se indica.
- Falta: pruebas automatizadas, control fino de permisos por ruta en middleware/DRF PermissionClasses, y añadir UI para editar permisos individuales (pendiente).

## 7. Estado de la integración de registro (frontend)
- [x] **Integrar registro de usuario/persona en el frontend**
    - Formulario en Next.js que envía los datos al endpoint `/api/usuarios/registro/`.
    - Validación de campos requeridos en el cliente y exposición de mensajes de error del backend cuando ocurren.
    - Flujo completo probado: creación desde la interfaz web, redirección al listado y visualización del nuevo usuario.

### [05/Mar/2026] Borrado de Usuarios (Backend + Frontend)

- [x] **Endpoint de borrado (backend):**
    - Creado endpoint protegido `DELETE /api/usuarios/eliminar/<id>/` que trabaja sobre el vínculo `UserPersona`.
    - Elimina al usuario de Django y a la persona asociada dentro de una transacción atómica.
    - Restringido a administradores (`IsAdminUser`).
- [x] **Acción Borrar en listado (frontend):**
    - El botón **Borrar** en la tabla de usuarios ahora llama al endpoint `DELETE /api/usuarios/eliminar/<id>/`.
    - Se muestra una confirmación en el navegador antes de eliminar.
    - Tras un borrado exitoso, redirige a `/users?deleted=1` para recargar la lista.
- [x] **Mensaje de éxito al eliminar:**
    - La pantalla `/users` detecta el parámetro `?deleted=1`.
    - Muestra un mensaje verde "Usuario eliminado correctamente." con opción de cerrarlo y auto-ocultado tras unos segundos.


### [05/Mar/2026] UI: Avatar por defecto y fallback

- [x] **Cambio aplicado:** Se estandarizó una imagen por defecto para avatares en el frontend y se añadió un fallback en caso de error de carga.

- [x] **Qué se hizo:**
    - Reemplazadas referencias a `/images/user/*` por la imagen por defecto `/images/cover/man_5615661.png` donde tenía sentido.
    - Añadido `onError` en elementos `<img>` para restaurar la imagen por defecto si falla la carga.

- [x] **Archivos modificados:**
    - `frontend-next/src/components/Header/DropdownUser.tsx`
    - `frontend-next/src/components/Header/DropdownMessage.tsx`
    - `frontend-next/src/components/Chat/ChatCard.tsx`
    - `frontend-next/src/app/(dashboard)/profile/page.tsx`
    - `frontend-next/src/app/(dashboard)/settings/page.tsx`

---
*Este archivo sirve como punto de control para el desarrollo del proyecto.*

