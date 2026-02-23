from django.contrib import admin
from .models import Gerencias, Divisiones, Coordinaciones, PersonaGerencia

admin.site.register(Gerencias)
admin.site.register(Divisiones)
admin.site.register(Coordinaciones)
admin.site.register(PersonaGerencia)
