from django.db import models
from django.conf import settings

class Project(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    name = models.CharField(max_length=100)
    framework = models.CharField(max_length=50, blank=True)
    repository_url = models.URLField(blank=True)
    port = models.PositiveIntegerField(default=3000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.names