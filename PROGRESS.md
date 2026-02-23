# Registro de Progreso del Proyecto SISMED

**Fecha:** 20 de Febrero de 2026

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

## 2. Estado Actual del Sistema
- [x] **Estructura de Carpetas**: Todas las apps creadas en `backend/`.
- [x] **Configuración Django**: `settings.py` actualizado con las nuevas apps y la conexión a BD.
- [x] **Migraciones**: 
    - Se generaron las migraciones iniciales (`0001_initial.py`) para reflejar el estado actual de los modelos.
    - Se ejecutaron las migraciones del sistema (`auth`, `admin`, `sessions`) en la base de datos PostgreSQL.
- [x] **Administración**:
    - Superusuario creado (User: `admin` / Pass: `admin`).
    - Panel de administración accesible en `http://127.0.0.1:8000/admin`.
    - **Modelos Registrados**: Todos los modelos (Personas, Citas, Historia Médica, etc.) han sido registrados en `admin.py` y son visibles/editables desde la interfaz web.

## 3. Próximos Pasos Pendientes
- **API (Django Rest Framework)**: Configurar los Serializers y ViewSets para exponer los datos al Frontend.
- **Frontend**: Comenzar la integración de las pantallas con la nueva API.

---
*Este archivo sirve como punto de control para el desarrollo del proyecto.*
