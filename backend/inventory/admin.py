from django.contrib import admin
from .models import PrincipioActivo, Medicamentos, Lote, MedicamentoLote, MovimientoLote, MovimientoCita, MovimientoBeneficios

admin.site.register(PrincipioActivo)
admin.site.register(Medicamentos)
admin.site.register(Lote)
admin.site.register(MedicamentoLote)
admin.site.register(MovimientoLote)
admin.site.register(MovimientoCita)
admin.site.register(MovimientoBeneficios)
