from django.db import models
from django.conf import settings
from .fields import EncryptedCharField

class Server(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='servers',
    )
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    ssh_port = models.PositiveIntegerField(default=22)
    ssh_username = models.CharField(max_length=100)
    ssh_password = EncryptedCharField(max_length=500)
    operating_system = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CommandHistory(models.Model):
    server = models.ForeignKey(
        Server,
        on_delete=models.CASCADE,
        related_name='command_history',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    command = models.CharField(max_length=1000)
    output = models.TextField(blank=True)
    error = models.TextField(blank=True)
    exit_code = models.IntegerField(null=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.command} on {self.server.name}"