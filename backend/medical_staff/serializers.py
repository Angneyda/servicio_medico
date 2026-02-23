from rest_framework import serializers
from .models import Doctores

class MedicalStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctores
        fields = '__all__'
