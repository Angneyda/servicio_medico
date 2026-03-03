from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from .models import Personas, UserPersona, TIPO_PERSONA_CHOICES, ESTATUS_CHOICES

# --- Aprendizaje: Serializer para registro de usuario ---
# Este serializer permite crear un usuario nuevo desde la API.
# Documenta el proceso de registro y los campos requeridos.
# --- Aprendizaje: Serializer para registro de usuario ---
# Este serializer permite crear un usuario nuevo desde la API.
# Documenta el proceso de registro y los campos requeridos.


# ------------------------ Registro de usuario y persona asociada ----------------------------

# Este serializer permite crear un usuario y su persona asociada en un solo paso.
class UserRegisterSerializer(serializers.ModelSerializer):
    # --- Aprendizaje: Campos para registro de usuario y persona ---
    password = serializers.CharField(write_only=True)  # Contraseña del usuario, solo se envía al crear, nunca se muestra.
    cedula = serializers.CharField(max_length=20)      # Cédula de la persona asociada.
    nombre = serializers.CharField(max_length=150)     # Nombre de la persona asociada.
    apellido = serializers.CharField(max_length=150)   # Apellido de la persona asociada.
    sexo = serializers.CharField(max_length=10)        # Sexo de la persona asociada.
    fecha_nacimiento = serializers.DateField()         # Fecha de nacimiento de la persona asociada.
    telefono = serializers.CharField(max_length=20)    # Teléfono de la persona asociada.
    # --- Aprendizaje: tipo_persona como ChoiceField validado ---
    tipo_persona = serializers.ChoiceField(
        choices=TIPO_PERSONA_CHOICES,  # 1=Personal, 2=Jubilado, 3=Familiar, 4=Cortesía
    )
    # --- Aprendizaje: estatus como ChoiceField (1=Activo, 2=Inactivo) ---
    estatus = serializers.ChoiceField(
        choices=ESTATUS_CHOICES,
        required=False,
        allow_null=True,
    )

    # --- Aprendizaje: Validación personalizada para username ---
    def validate_username(self, value):
        # Verifica que el username no exista en la base de datos.
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El username ya existe.')
        return value

    class Meta:
        model = User  # Modelo base para el registro (Django User).
        fields = [
            'username',    # Nombre de usuario para login.
            'email',       # Correo del usuario.
            'password',    # Contraseña del usuario.
            # Campos de persona
            'cedula', 'nombre', 'apellido', 'sexo', 'fecha_nacimiento',
            'telefono', 'tipo_persona', 'estatus'
        ]

    def create(self, validated_data):
        # --- Aprendizaje: Proceso de creación de usuario y persona con validaciones y transacción ---
        # Usamos transaction.atomic() para asegurar que todo el proceso sea atómico.
        # Si ocurre un error en cualquier paso, se revierte todo.
        with transaction.atomic():
            # Extrae datos de usuario
            username = validated_data['username']  # Obtiene el nombre de usuario.
            email = validated_data.get('email')    # Obtiene el correo del usuario.
            password = validated_data['password']  # Obtiene la contraseña del usuario.
            tipo_persona = validated_data['tipo_persona']  # Obtiene el tipo de persona.
            # Estatus: si viene null o vacío, forzamos 1 (Activo)
            raw_estatus = validated_data.get('estatus')
            estatus = raw_estatus if raw_estatus not in (None, '') else 1

            # Extrae datos de persona para crear el registro asociado
            persona_data = {
                'cedula': validated_data['cedula'],           # Cédula
                'nombre': validated_data['nombre'],           # Nombre
                'apellido': validated_data['apellido'],       # Apellido
                'sexo': validated_data['sexo'],               # Sexo
                'fecha_nacimiento': validated_data['fecha_nacimiento'], # Fecha de nacimiento
                'correo': email,                             # Correo de la persona (mismo que email de usuario)
                'telefono': validated_data['telefono'],       # Teléfono
                'tipo_persona': tipo_persona,                 # Tipo de persona
                'estatus': estatus,                           # Estatus (1=Activo, 2=Inactivo)
            }

            # Crea la persona asociada en la base de datos
            persona = Personas.objects.create(**persona_data)

            # --- Aprendizaje: Solo ciertos tipos de persona pueden tener usuario ---
            # --- Aprendizaje: Define los tipos permitidos por número ---
            TIPOS_CON_USUARIO = [1, 2]  # Ejemplo: 1=personal, 2=jubilado
            if tipo_persona in TIPOS_CON_USUARIO:
                # Crea el usuario en la base de datos
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
                # Asignar grupo aquí si lo deseas
                # Crea la relación entre usuario y persona
                UserPersona.objects.create(user=user, persona=persona)
                return user  # Devuelve el usuario creado
            # Si el tipo_persona no permite usuario, solo retorna la persona
            return persona  # Devuelve la persona creada (sin usuario)
    
    

class PersonaSerializer(serializers.ModelSerializer):
    tipo_persona = serializers.ChoiceField(
        choices=TIPO_PERSONA_CHOICES,
        required=False,
        allow_null=True,
    )
    estatus = serializers.ChoiceField(
        choices=ESTATUS_CHOICES,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Personas
        fields = [
            'id',
            'cedula',
            'nombre',
            'apellido',
            'sexo',
            'fecha_nacimiento',
            'correo',
            'telefono',
            'tipo_persona',
            'estatus',
        ]
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserPersonaDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    persona = PersonaSerializer(read_only=True)

    class Meta:
        model = UserPersona
        fields = ['id', 'user', 'persona']
        read_only_fields = ['id', 'user', 'persona']


class UserPersonaCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    persona = PersonaSerializer()

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El username ya existe.')
        return value

    def create(self, validated_data):
        persona_data = validated_data.pop('persona')
        password = validated_data.pop('password')

        if not persona_data.get('nombre'):
            persona_data['nombre'] = validated_data.get('first_name') or ''
        if not persona_data.get('apellido'):
            persona_data['apellido'] = validated_data.get('last_name') or ''
        if not persona_data.get('correo'):
            persona_data['correo'] = validated_data.get('email') or ''

        with transaction.atomic():
            user = User.objects.create_user(password=password, **validated_data)
            persona = Personas.objects.create(**persona_data)
            return UserPersona.objects.create(user=user, persona=persona)
        

class UsuarioListaSerializer(serializers.ModelSerializer):
    """
    Lista usuarios mostrando datos combinados de User y Personas.

    Campos: id (del vínculo), username, email, cedula, nombre, apellido, rol.
    """

    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    cedula = serializers.ReadOnlyField(source='persona.cedula')
    nombre = serializers.ReadOnlyField(source='persona.nombre')
    apellido = serializers.ReadOnlyField(source='persona.apellido')
    rol = serializers.SerializerMethodField()

    class Meta:
        model = UserPersona
        fields = [
            'id',
            'username',
            'email',
            'cedula',
            'nombre',
            'apellido',
            'rol',
        ]

    def get_rol(self, obj) -> str:
        """
        Devuelve el nombre del primer grupo (rol) del usuario.
        Si no tiene grupos, devuelve cadena vacía.
        """
        user = obj.user
        first_group = user.groups.first()
        return first_group.name if first_group is not None else ''
