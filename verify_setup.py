import os
import django
import sys

# Add the project root to the python path
sys.path.append('/home/jcabrices/sismed')
sys.path.append('/home/jcabrices/sismed/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.sismed_backend.settings')
django.setup()

from users.models import Personas
from organization.models import Gerencias
from medical_staff.models import Doctores
from appointments.models import CitaMedica
from medical_history.models import HistoriaMedica
from inventory.models import Medicamentos

def check_model(model_class, name):
    try:
        count = model_class.objects.count()
        print(f"SUCCESS: Connection to {name} ({model_class._meta.db_table}) established. Count: {count}")
    except Exception as e:
        print(f"ERROR: Could not query {name} ({model_class._meta.db_table}). Error: {e}")

print("--- Verifying Django App Configuration ---")
check_model(Personas, "Users App (Personas)")
check_model(Gerencias, "Organization App (Gerencias)")
check_model(Doctores, "Medical Staff App (Doctores)")
check_model(CitaMedica, "Appointments App (CitaMedica)")
check_model(HistoriaMedica, "Medical History App (HistoriaMedica)")
check_model(Medicamentos, "Inventory App (Medicamentos)")
print("--- Verification Complete ---")
