from django.db import models

class Gerencias(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"organization"."gerencias"'

class Divisiones(models.Model):
    id = models.AutoField(primary_key=True)
    id_gerencia = models.ForeignKey(Gerencias, models.DO_NOTHING, db_column='id_gerencia', null=True, blank=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"organization"."divisiones"'

class Coordinaciones(models.Model):
    id = models.AutoField(primary_key=True)
    id_division = models.ForeignKey(Divisiones, models.DO_NOTHING, db_column='id_division', null=True, blank=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"organization"."coordinaciones"'

class PersonaGerencia(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    id_gerencia = models.ForeignKey(Gerencias, models.DO_NOTHING, db_column='id_gerencia', null=True, blank=True)
    id_division = models.ForeignKey(Divisiones, models.DO_NOTHING, db_column='id_division', null=True, blank=True)
    id_coordinacion = models.ForeignKey(Coordinaciones, models.DO_NOTHING, db_column='id_coordinacion', null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='personagerencia_create', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='personagerencia_update', null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"organization"."persona_gerencia"'
