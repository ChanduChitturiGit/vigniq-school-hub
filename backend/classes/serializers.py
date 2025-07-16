from rest_framework import serializers
from .models import SchoolClass

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ['id', 'name','section']

