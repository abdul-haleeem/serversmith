from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet

def get_cipher():
    return Fernet(settings.FIELD_ENCRYPTION_KEY.encode())

class EncryptedCharField(models.CharField):
    def get_prep_value(self, value):
        if value is None or value == '':
            return value
        cipher = get_cipher()
        return cipher.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None or value == '':
            return value
        cipher = get_cipher()
        return cipher.decrypt(value.encode()).decode()