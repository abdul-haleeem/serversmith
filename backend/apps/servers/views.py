from rest_framework import viewsets, permissions
from .models import Server
from .serializers import ServerSerializer
from .permissions import IsOwner

class ServerViewSet(viewsets.ModelViewSet):
    serializer_class = ServerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Server.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)