from django.db import models
from django.conf import settings
from apps.projects.models import Project
from apps.servers.models import Server

class Deployment(models.Model):
    PENDING = 'PENDING'
    RUNNING = 'RUNNING'
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (RUNNING, 'Running'),
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='deployments')
    server = models.ForeignKey(Server, on_delete=models.CASCADE, related_name='deployments')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    version = models.CharField(max_length=50, blank=True)
    logs = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.project.name} -> {self.server.name} ({self.status})"