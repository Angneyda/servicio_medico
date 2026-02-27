"""
URL configuration for sismed_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


"""
Archivo de rutas principal (urls.py) del proyecto sismed_backend.
Aquí se organizan y agrupan las rutas de todas las apps del proyecto.
"""

# Importa el panel de administración de Django
from django.contrib import admin
# Importa path para definir rutas y include para incluir rutas de otras apps
from django.urls import path, include
# Importa DefaultRouter para registrar ViewSets de otras apps
from rest_framework.routers import DefaultRouter

# Importa los ViewSets de otras apps para el router
from medical_staff.views import MedicalStaffViewSet
from medical_history.views import MedicalHistoryViewSet

# Crea un router para registrar rutas automáticas de ViewSets
router = DefaultRouter()
router.register(r'medical_staff', MedicalStaffViewSet)      # Rutas de personal médico
router.register(r'medical_history', MedicalHistoryViewSet)  # Rutas de historia médica

# Lista de rutas principales del proyecto
urlpatterns = [
    # Acceso al panel de administración de Django (interfaz web para admins)
    path('admin/', admin.site.urls),

    # Incluye las rutas automáticas generadas por el router (ViewSets de otras apps)
    # Ejemplo: /api/medical_staff/ y /api/medical_history/
    path('api/', include(router.urls)),

    # Incluye todas las rutas de la app users bajo el prefijo /api/usuarios/
    # Ejemplo: /api/usuarios/registro/, /api/usuarios/login/, etc.
    path('api/usuarios/', include('users.urls')),
]

