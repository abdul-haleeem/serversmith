from rest_framework import viewsets, permissions
from .models import Server
from .serializers import ServerSerializer
from .permissions import IsOwner
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import SSHService
from .models import CommandHistory
from .serializers import CommandHistorySerializer

class ServerViewSet(viewsets.ModelViewSet):
    serializer_class = ServerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Server.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        server = self.get_object()
        service = SSHService(server)
        result = service.test_connection()
        return Response(result)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        server = self.get_object()
        command = request.data.get('command')

        if not command:
            return Response({"error": "command is required"}, status=400)

        service = SSHService(server)
        result = service.execute_command(command)

        CommandHistory.objects.create(
            server=server,
            user=request.user,
            command=command,
            output=result['output'],
            error=result['error'],
            exit_code=result['exit_code'],
        )

        return Response(result)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        server = self.get_object()
        history = server.command_history.all().order_by('-executed_at')
        serializer = CommandHistorySerializer(history, many=True)
        return Response(serializer.data)