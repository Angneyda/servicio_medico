from django.db import models

class Agenda(models.Model):
    id = models.AutoField(primary_key=True)
    id_especialidad = models.ForeignKey('medical_staff.Especialidades', models.DO_NOTHING, db_column='id_especialidad', null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    cupo_total = models.IntegerField(null=True, blank=True)
    cupo_disp = models.IntegerField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    observacion = models.TextField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='agenda_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='agenda_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."agenda"'

class CitaMedica(models.Model):
    id = models.AutoField(primary_key=True)
    id_agenda = models.ForeignKey(Agenda, models.DO_NOTHING, db_column='id_agenda', null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', null=True, blank=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    first_time = models.BooleanField(default=False)
    fecha_hora_creacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."cita_medica"'

class DoctorAgenda(models.Model):
    id = models.AutoField(primary_key=True)
    id_agenda = models.ForeignKey(Agenda, models.DO_NOTHING, db_column='id_agenda', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."doctor_agenda"'

class Documentos(models.Model):
    id = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey(CitaMedica, models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    documento = models.TextField(null=True, blank=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    fecha_registro = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."documentos"'

class Vitales(models.Model):
    id = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey(CitaMedica, models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    tension_arterial = models.CharField(max_length=255, null=True, blank=True)
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    talla = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    temperatura = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='vitales_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='vitales_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."vitales"'

class ReferenciaMedica(models.Model):
    id = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey(CitaMedica, models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    id_tipo_referencia = models.IntegerField(null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    fecha_create = models.DateField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"appointments"."referencia_medica"'
