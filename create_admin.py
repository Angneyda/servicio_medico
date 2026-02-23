import os
import django
import sys
from django.contrib.auth import get_user_model

# Add the project root to the python path
sys.path.append('/home/jcabrices/sismed')
sys.path.append('/home/jcabrices/sismed/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.sismed_backend.settings')
django.setup()

User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'admin'

if not User.objects.filter(username=username).exists():
    print(f"Creando superusuario '{username}'...")
    User.objects.create_superuser(username, email, password)
    print(f"Superusuario creado exitosamente. Usuario: {username}, Contraseña: {password}")
else:
    print(f"El usuario '{username}' ya existe.")
