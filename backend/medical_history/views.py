from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import HistoriaMedica
from .serializers import MedicalHistorySerializer

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = HistoriaMedica.objects.all()
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated]
