from rest_framework import serializers
from .models import HistoriaMedica

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriaMedica
        fields = '__all__'
