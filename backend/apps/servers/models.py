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