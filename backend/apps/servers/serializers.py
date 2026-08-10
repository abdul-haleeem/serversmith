from rest_framework import serializers
from .models import Server

class ServerSerializer(serializers.ModelSerializer):
    ssh_password = serializers.CharField(write_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Server
        fields = [
            'id', 'name', 'ip_address', 'ssh_port', 'ssh_username',
            'ssh_password', 'operating_system', 'owner',
            'created_at', 'updated_at',
        ]