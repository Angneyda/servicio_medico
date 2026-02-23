from django.db import models

class Especialidades(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='especialidades_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='especialidades_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_staff"."especialidades"'

class Doctores(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    id_especialidad = models.ForeignKey(Especialidades, models.DO_NOTHING, db_column='id_especialidad', null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='doctores_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='doctores_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_staff"."doctores"'
