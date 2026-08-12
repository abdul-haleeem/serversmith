from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'framework', 'repository_url', 'port',
            'owner', 'created_at', 'updated_at',
        ]