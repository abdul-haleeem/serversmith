from rest_framework import viewsets, permissions
from .models import Server, CommandHistory, ServerMetric
from .serializers import ServerSerializer, CommandHistorySerializer, ServerMetricSerializer
from .permissions import IsOwner
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import SSHService

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


    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        server = self.get_object()
        service = SSHService(server)
        result = service.get_metrics()

        if result.get('memory') and result.get('disk'):
            ServerMetric.objects.create(
                server=server,
                memory_percent=result['memory']['percent'],
                disk_percent=result['disk']['percent'],
            )

        return Response(result)

    @action(detail=True, methods=['get'])
    def metrics_history(self, request, pk=None):
        server = self.get_object()
        metrics = server.metrics.all()[:20]
        serializer = ServerMetricSerializer(metrics, many=True)
        return Response(serializer.data)