from django.db import models

class PrincipioActivo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."principio_activo"'

class Medicamentos(models.Model):
    id = models.AutoField(primary_key=True)
    id_principioactivo = models.ForeignKey(PrincipioActivo, models.DO_NOTHING, db_column='id_principioactivo', null=True, blank=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)
    concentracion = models.CharField(max_length=255, null=True, blank=True)
    forma_farmaceutica = models.CharField(max_length=255, null=True, blank=True)
    id_usuario = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usuario', null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."medicamentos"'

class Lote(models.Model):
    id = models.AutoField(primary_key=True)
    id_medicamento = models.ForeignKey(Medicamentos, models.DO_NOTHING, db_column='id_medicamento', null=True, blank=True)
    lote = models.CharField(max_length=255, null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    cantidad_lote = models.IntegerField(null=True, blank=True)
    cantidad_actual = models.IntegerField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    fecha_registro = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."lote"'

class MedicamentoLote(models.Model):
    id = models.AutoField(primary_key=True)
    id_medicamento = models.ForeignKey(Medicamentos, models.DO_NOTHING, db_column='id_medicamento', null=True, blank=True)
    id_lote = models.ForeignKey(Lote, models.DO_NOTHING, db_column='id_lote', null=True, blank=True)
    id_usuario = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usuario', null=True, blank=True)
    estado = models.IntegerField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."medicamento_lote"'

class MovimientoLote(models.Model):
    id = models.AutoField(primary_key=True)
    id_lote = models.ForeignKey(Lote, models.DO_NOTHING, db_column='id_lote', null=True, blank=True)
    tipo_movimiento = models.IntegerField(null=True, blank=True)
    cantidad = models.IntegerField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    motivo = models.CharField(max_length=255, null=True, blank=True)
    observacion = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."movimiento_lote"'

class MovimientoCita(models.Model):
    id = models.AutoField(primary_key=True)
    id_movimientolote = models.ForeignKey(MovimientoLote, models.DO_NOTHING, db_column='id_movimientolote', null=True, blank=True)
    id_historia_medica = models.ForeignKey('medical_history.HistoriaMedica', models.DO_NOTHING, db_column='id_historia_medica', null=True, blank=True)
    motivo = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."movimiento_cita"'

class MovimientoBeneficios(models.Model):
    id = models.AutoField(primary_key=True)
    id_mov_lote = models.ForeignKey(MovimientoLote, models.DO_NOTHING, db_column='id_mov_lote', null=True, blank=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"inventory"."movimiento_beneficios"'
