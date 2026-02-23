from django.db import models

class NumHistoria(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    num_historia = models.IntegerField(null=True, blank=True)
    fecha_apertura = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."num_historia"'

class HistoriaMedica(models.Model):
    id = models.AutoField(primary_key=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    id_cita = models.ForeignKey('appointments.CitaMedica', models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    motivo_consulta = models.TextField(null=True, blank=True)
    examen_fisico = models.TextField(null=True, blank=True)
    diagnostico = models.TextField(null=True, blank=True)
    tratamiento = models.TextField(null=True, blank=True)
    indicaciones = models.TextField(null=True, blank=True)
    examenes_solicitados = models.TextField(null=True, blank=True)
    interconsulta = models.IntegerField(null=True, blank=True)
    especialidad_interconsulta = models.TextField(null=True, blank=True)
    exam_solic = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."historia_medica"'

class AntecedentesGenerales(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    alergias = models.BooleanField(default=False)
    medicamentos_habituales = models.BooleanField(default=False)
    antecedentes_quirurgicos = models.BooleanField(default=False)
    apf = models.BooleanField(default=False)
    apnp = models.BooleanField(default=False)
    app = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_generales"'

class TipoAntecedentes(models.Model):
    id = models.AutoField(primary_key=True)
    id_especialidad = models.ForeignKey('medical_staff.Especialidades', models.DO_NOTHING, db_column='id_especialidad', null=True, blank=True)
    tipo_antecedente = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."tipo_antecedentes"'

class AntecedentesgDescrip(models.Model):
    id = models.AutoField(primary_key=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    id_antecedenteg = models.ForeignKey(AntecedentesGenerales, models.DO_NOTHING, db_column='id_antecedenteg', null=True, blank=True)
    id_tipo_anteced = models.ForeignKey(TipoAntecedentes, models.DO_NOTHING, db_column='id_tipo_anteced', null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_registro = models.DateTimeField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentesg_descrip"'

class AntecedentesAlergia(models.Model):
    id = models.AutoField(primary_key=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    id_antecedenteg = models.ForeignKey(AntecedentesGenerales, models.DO_NOTHING, db_column='id_antecedenteg', null=True, blank=True)
    sustancia = models.CharField(max_length=255, null=True, blank=True)
    tipo_reaccion = models.CharField(max_length=255, null=True, blank=True)
    gravedad = models.CharField(max_length=255, null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    activo = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_alergia"'

class AntecedentesMedicamentosh(models.Model):
    id = models.AutoField(primary_key=True)
    id_antecedenteg = models.ForeignKey(AntecedentesGenerales, models.DO_NOTHING, db_column='id_antecedenteg', null=True, blank=True)
    medicamento = models.CharField(max_length=255, null=True, blank=True)
    dosis = models.CharField(max_length=255, null=True, blank=True)
    frecuencia = models.CharField(max_length=255, null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    activo = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_medicamentosh"'

class AntecedentesGinecologia(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    edad_menarquia = models.IntegerField(null=True, blank=True)
    ciclo_regular = models.IntegerField(null=True, blank=True)
    fum = models.DateField(null=True, blank=True)
    dismenorrea = models.BooleanField(default=False)
    sangrado_anormal = models.BooleanField(default=False)
    metodo_anticonceptivo = models.TextField(null=True, blank=True)
    its = models.BooleanField(default=False)
    update_at = models.DateTimeField(null=True, blank=True)
    create_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_ginecologia"'

class Its(models.Model):
    id = models.AutoField(primary_key=True)
    id_aginecologia = models.ForeignKey(AntecedentesGinecologia, models.DO_NOTHING, db_column='id_aginecologia', related_name='its_list', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    tipo = models.IntegerField(null=True, blank=True)
    fecha_diagnostico = models.DateField(null=True, blank=True)
    tratamiento = models.TextField(null=True, blank=True)
    tratam_prolongado = models.IntegerField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    create_at = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."its"'

class AntecedentesGinecoObstetrico(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    gestas = models.BooleanField(default=False)
    partos = models.BooleanField(default=False)
    cesareas = models.BooleanField(default=False)
    abortos = models.BooleanField(default=False)
    hijos = models.IntegerField(null=True, blank=True)
    ectopicos = models.BooleanField(default=False)
    create_at = models.DateTimeField(null=True, blank=True)
    update_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_gineco_obstetrico"'

class EventosObstetrico(models.Model):
    id = models.AutoField(primary_key=True)
    id_aginecobstetrico = models.ForeignKey(AntecedentesGinecoObstetrico, models.DO_NOTHING, db_column='id_aginecobstetrico', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    tipo = models.IntegerField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    semana_gestacion = models.IntegerField(null=True, blank=True)
    resultados = models.TextField(null=True, blank=True)
    complicaciones = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."eventos_obstetrico"'

class Ecosonografico(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    id_cita = models.IntegerField(null=True, blank=True) # It seems this should be a FK to appointments.CitaMedica, but leaving as int as per original
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    transductor_convex = models.BooleanField(default=False)
    transductor_transvaginal = models.BooleanField(default=False)
    vejiga_llena = models.BooleanField(default=False)
    vejiga_normal = models.BooleanField(default=False)
    utero_posicion = models.IntegerField(null=True, blank=True)
    utero_forma = models.IntegerField(null=True, blank=True)
    utero_borde = models.IntegerField(null=True, blank=True)
    patron_miometrial = models.IntegerField(null=True, blank=True)
    utero_longitud = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    utero_transverso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    utero_ap = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    endometrio_visible = models.BooleanField(default=False)
    endometrio_continuo = models.BooleanField(default=False)
    endometrio_homogeneo = models.BooleanField(default=False)
    cavidad_estado = models.BooleanField(default=False)
    cavidad_espesor = models.CharField(max_length=255, null=True, blank=True)
    otros_hallazgos = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    conclusiones = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."ecosonografico"'

class Ovarios(models.Model):
    id = models.AutoField(primary_key=True)
    id_eco = models.ForeignKey(Ecosonografico, models.DO_NOTHING, db_column='id_eco', null=True, blank=True)
    ovario_lado = models.IntegerField(null=True, blank=True)
    longitud = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    transversal = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ap = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    volumen = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."ovarios"'

class AntecedentesSaludmental(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    appp = models.BooleanField(default=False)
    appf = models.BooleanField(default=False)
    habitos_p = models.BooleanField(default=False)
    historia_biopatog = models.BooleanField(default=False)
    genitograma = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_saludmental"'

class HistoriaBiopatografica(models.Model):
    id = models.AutoField(primary_key=True)
    id_antecedentessm = models.ForeignKey(AntecedentesSaludmental, models.DO_NOTHING, db_column='id_antecedentessm', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    activo = models.IntegerField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."historia_biopatografica"'

class AntecedentesPediatricos(models.Model):
    id = models.AutoField(primary_key=True)
    id_numhistoria = models.ForeignKey(NumHistoria, models.DO_NOTHING, db_column='id_numhistoria', null=True, blank=True)
    a_prenatal = models.BooleanField(default=False)
    a_perinatales = models.BooleanField(default=False)
    a_postnatales = models.BooleanField(default=False)
    a_vacunas = models.BooleanField(default=False)
    alimentacion_p = models.BooleanField(default=False)
    desarrollo_p = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentes_pediatricos"'

class AlimentacionP(models.Model):
    id = models.AutoField(primary_key=True)
    id_apediatrica = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apediatrica', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    tipo = models.IntegerField(null=True, blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    fecha_registro = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."alimentacion_p"'

class DesarrolloP(models.Model):
    id = models.AutoField(primary_key=True)
    id_apediatrica = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apediatrica', null=True, blank=True)
    edad_meses = models.IntegerField(null=True, blank=True)
    area = models.IntegerField(null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    fecha_registro = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."desarrollo_p"'

class APerinatales(models.Model):
    id = models.AutoField(primary_key=True)
    id_apedriaticos = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apedriaticos', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    edad_gestacional = models.IntegerField(null=True, blank=True)
    apgar_1 = models.IntegerField(null=True, blank=True)
    apgar_5 = models.IntegerField(null=True, blank=True)
    peso_nacer = models.IntegerField(null=True, blank=True)
    talla_nacer = models.IntegerField(null=True, blank=True)
    complicaciones = models.TextField(null=True, blank=True)
    hospitalizacion = models.BooleanField(default=False)
    fecha_registro = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."a_perinatales"'

class AntecedentespDescrip(models.Model):
    id = models.AutoField(primary_key=True)
    id_antecedente_sm = models.ForeignKey(AntecedentesSaludmental, models.DO_NOTHING, db_column='id_antecedente_sm', null=True, blank=True)
    id_tipo_anteced = models.ForeignKey(TipoAntecedentes, models.DO_NOTHING, db_column='id_tipo_anteced', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_registro = models.DateTimeField(null=True, blank=True)
    activo = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."antecedentesp_descrip"'

class Genitograma(models.Model):
    id = models.AutoField(primary_key=True)
    id_antecedentesm = models.ForeignKey(AntecedentesSaludmental, models.DO_NOTHING, db_column='id_antecedentesm', related_name='genitograma_list', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."genitograma"'

class APostnatales(models.Model):
    id = models.AutoField(primary_key=True)
    id_apedriatica = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apedriatica', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    gravedad = models.TextField(null=True, blank=True)
    fecha_evento = models.DateTimeField(null=True, blank=True)
    hospitalizacion = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"medical_history"."a_postnatales"'

class APrenatal(models.Model):
    id = models.AutoField(primary_key=True)
    id_apediatrico = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apediatrico', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    control_prenatal = models.IntegerField(null=True, blank=True)
    enfermedades_maternas = models.TextField(null=True, blank=True)
    infecciones = models.TextField(null=True, blank=True)
    consumos_sustancias = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    fecha_registro = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."a_prenatal"'

class Vacunas(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."vacunas"'

class AVacunas(models.Model):
    id = models.AutoField(primary_key=True)
    id_apediatrica = models.ForeignKey(AntecedentesPediatricos, models.DO_NOTHING, db_column='id_apediatrica', null=True, blank=True)
    id_vacuna = models.ForeignKey(Vacunas, models.DO_NOTHING, db_column=' id_vacuna', null=True, blank=True)
    dosis = models.CharField(max_length=255, null=True, blank=True)
    fecha_aplicacion = models.DateField(null=True, blank=True)
    lote = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."a_vacunas"'
    
class TipoExamenes(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='tipoexamenes_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='tipoexamenes_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."tipo_examenes"'

class Examenes(models.Model):
    id = models.AutoField(primary_key=True)
    id_tipoexam = models.ForeignKey(TipoExamenes, models.DO_NOTHING, db_column='id_tipoexam', null=True, blank=True)
    nombre = models.CharField(max_length=255, null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    lab = models.BooleanField(default=False)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='examenes_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='examenes_update', null=True, blank=True)
    fecha_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."examenes"'

class CitasLab(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey('users.Personas', models.DO_NOTHING, db_column='id_persona', null=True, blank=True)
    id_agenda = models.ForeignKey('appointments.Agenda', models.DO_NOTHING, db_column='id_agenda', null=True, blank=True)
    id_examen = models.ForeignKey(Examenes, models.DO_NOTHING, db_column='id_examen', null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    inter_extern = models.IntegerField(null=True, blank=True)
    id_cita = models.ForeignKey('appointments.CitaMedica', models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    observacion = models.TextField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', related_name='citaslab_create', null=True, blank=True)
    fecha_create = models.DateTimeField(null=True, blank=True)
    id_usupdate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usupdate', related_name='citaslab_update', null=True, blank=True)
    fecha_update = models.TimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."citas_lab"'

class Odontograma(models.Model):
    id = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey('appointments.CitaMedica', models.DO_NOTHING, db_column='id_cita', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    observacion = models.TextField(null=True, blank=True)
    id_usucreate = models.ForeignKey('users.Usuarios', models.DO_NOTHING, db_column='id_usucreate', null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."odontograma"'

class OdontogramaDiente(models.Model):
    id = models.AutoField(primary_key=True)
    id_odontograma = models.ForeignKey(Odontograma, models.DO_NOTHING, db_column='id_odontograma', null=True, blank=True)
    id_doctor = models.ForeignKey('medical_staff.Doctores', models.DO_NOTHING, db_column='id_doctor', null=True, blank=True)
    pieza_dental = models.CharField(max_length=255, null=True, blank=True)
    estado = models.IntegerField(null=True, blank=True)
    estatus = models.IntegerField(null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    observacion = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"medical_history"."odontograma_diente"'
