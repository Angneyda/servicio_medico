from django.contrib import admin
from .models import Agenda, CitaMedica, DoctorAgenda, Documentos, Vitales, ReferenciaMedica

admin.site.register(Agenda)
admin.site.register(CitaMedica)
admin.site.register(DoctorAgenda)
admin.site.register(Documentos)
admin.site.register(Vitales)
admin.site.register(ReferenciaMedica)
