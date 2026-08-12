from rest_framework import viewsets, permissions
from .models import Deployment
from .serializers import DeploymentSerializer
from .services import DeploymentService
from apps.servers.permissions import IsOwner

class DeploymentViewSet(viewsets.ModelViewSet):
    serializer_class = DeploymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    http_method_names = ['get', 'post', 'head']

    def get_queryset(self):
        return Deployment.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        deployment = serializer.save(owner=self.request.user)
        DeploymentService(deployment).run()