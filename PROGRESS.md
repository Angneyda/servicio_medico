# Registro de Progreso del Proyecto SISMED

**Última Actualización:** 23 de Febrero de 2026

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
    - Habilitado CORS para permitir peticiones desde `localhost:5173`.
    - Configurada autenticación JWT por defecto.
- [x] **Endpoints Creados**:
    - `/api/token/`: Obtención de par de tokens (Access/Refresh).
    - `/api/token/refresh/`: Renovación de tokens.
    - `/api/medical_staff/`: CRUD para doctores y personal médico.
    - `/api/medical_history/`: CRUD para historias médicas.
- [x] **Serializers y Vistas**: Implementados ViewSets básicos para `Doctores` e `HistoriaMedica` utilizando sus nombres reales.

## 3. Desarrollo del Frontend (React + Vite)
Se ha integrado la plantilla **TailAdmin (React + TypeScript)** y configurado el sistema base.

- [x] **Estructura**: Organizado el proyecto en carpetas `services`, `context`, `hooks`, `components`, `pages`.
- [x] **Autenticación (JWT)**:
    - Implementado `AuthContext` para el manejo global de sesión y estado.
    - Configurado `axios` con interceptores para inyectar headers de autenticación; se programó la lógica de *refresh token* automático.
    - Creado componente `ProtectedRoute` para proteger rutas privadas y prevenir accesos no autorizados.
- [x] **Login y Navegación**:
    - Pantalla de Login (`SignIn.tsx`) funcional conectada con la API de Django.
    - Redirección automática al Dashboard tras el login.
    - Botón de **Log Out** completamente funcional en el Header.
- [x] **Componentes UI**:
    - Sidebar y Header configurados dinámicamente.
    - Creados hooks personalizados `useMedicalStaff` y `useMedicalHistory`.
    - Creado componente base `MedicalHistoryTable` (pendiente de probar con datos).

## 4. Gestión del Proyecto (Git)
- Se inicializó el repositorio Git y se conectó con GitLab.
- Se configuró `.gitignore` para excluir archivos innecesarios (`env/`, `pycache`, bd local).
- Se creó una rama de desarrollo `feature/frontend-init` para trabajar el frontend sin afectar `main`.

## 5. Próximos Pasos Pendientes
- [ ] **Consumo de Datos**: Crear páginas específicas ("Staff Médico", "Historias") en el frontend que usen los hooks creados para mostrar datos reales.
- [ ] **Formularios de Creación**: Implementar formularios para agregar pacientes y citas médicas.
- [ ] **Roles y Permisos**: Configurar permisos basados en grupos de Django para diferenciar interfaces entre Admin, Doctores y Pacientes.

---
*Este archivo sirve como punto de control para el desarrollo del proyecto.*
