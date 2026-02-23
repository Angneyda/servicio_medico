from django.db import models

class Personas(models.Model):
    id = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=255, null=True, blank=True, unique=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)
    apellido = models.CharField(max_length=255, null=True, blank=True)
    sexo = models.CharField(max_length=255, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    correo = models.CharField(max_length=255, null=True, blank=True)
    telefono = models.CharField(max_length=255, null=True, blank=True)
    tipo_persona = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='personas_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='personas_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"users"."personas"'

class Usuarios(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Personas, models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    tipo_usuario = models.IntegerField(null=True, blank=True)
    username = models.CharField(max_length=255, null=True, blank=True)
    contrasena = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.IntegerField(null=True, blank=True) # Check if this should be a FK
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.IntegerField(null=True, blank=True) # Check if this should be a FK
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"users"."usuarios"'

class Familiares(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Personas, models.DO_NOTHING, db_column='id_persona', related_name='familiares_persona', null=True, blank=True)
    id_familiar = models.ForeignKey(Personas, models.DO_NOTHING, db_column='id_familiar', related_name='familiares_familiar', null=True, blank=True)
    parentesco = models.IntegerField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usucreate', related_name='familiares_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usupdate', related_name='familiares_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"users"."familiares"'
