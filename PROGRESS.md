# Registro de Progreso del Proyecto SISMED

**Última Actualización:** 26 de Febrero de 2026

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
- [ ] **Listado Usuarios**: Mostrar usuarios con su persona vinculada en la pantalla de Usuarios.
- [ ] **Roles y Permisos (RBAC)**: Crear pantallas para gestión de Roles y Permisos (Groups/Permissions de Django).
- [ ] **Consumo de Datos**: Crear páginas específicas ("Staff Médico", "Historias") en el frontend que usen los hooks creados para mostrar datos reales.
- [ ] **Formularios de Creación**: Implementar formularios para agregar pacientes y citas médicas.
- [ ] **Roles y Permisos**: Configurar permisos basados en grupos de Django para diferenciar interfaces entre Admin, Doctores y Pacientes.
- [ ] **HTTPS en Producción**: Configurar certificados reales y activar `Secure` en cookies.
- [ ] **Revisión de CORS**: Ajustar orígenes permitidos según dominio final del frontend.

## 7. Próxima tarea frontend (pendiente)
- [ ] **Integrar registro de usuario/persona en el frontend**
    - Crear formulario en Next.js para enviar los datos al endpoint `/api/usuarios/registro/`.
    - Validar campos requeridos y mostrar mensajes de error del backend.
    - Probar flujo completo desde la interfaz web.
    - (Iniciar el lunes)

---
*Este archivo sirve como punto de control para el desarrollo del proyecto.*

