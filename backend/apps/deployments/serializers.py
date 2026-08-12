from rest_framework import serializers
from .models import Deployment
from apps.projects.models import Project
from apps.servers.models import Server

class DeploymentSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')
    server_name = serializers.ReadOnlyField(source='server.name')

    class Meta:
        model = Deployment
        fields = [
            'id', 'project', 'server', 'project_name', 'server_name',
            'status', 'version', 'logs', 'started_at', 'finished_at',
        ]
        read_only_fields = ['status', 'logs', 'started_at', 'finished_at']

    def validate(self, data):
        user = self.context['request'].user
        if data['project'].owner != user:
            raise serializers.ValidationError("You don't own this project.")
        if data['server'].owner != user:
            raise serializers.ValidationError("You don't own this server.")
        return data