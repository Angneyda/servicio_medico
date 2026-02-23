from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Doctores
from .serializers import MedicalStaffSerializer

class MedicalStaffViewSet(viewsets.ModelViewSet):
    queryset = Doctores.objects.all()
    serializer_class = MedicalStaffSerializer
    permission_classes = [IsAuthenticated]
