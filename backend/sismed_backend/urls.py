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

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from medical_staff.views import MedicalStaffViewSet
from medical_history.views import MedicalHistoryViewSet
from users.views import UsuariosLoginView, CookieTokenRefreshView, LogoutView, MeView

router = DefaultRouter()
router.register(r'medical_staff', MedicalStaffViewSet)
router.register(r'medical_history', MedicalHistoryViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', UsuariosLoginView.as_view(), name='usuarios_login'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh_cookie'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),
]

