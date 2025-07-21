from django.db import models

# Create your models here.

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    filename = models.CharField(max_length=255)
    patient_id = models.CharField(max_length=64)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.PositiveIntegerField()

    def __str__(self):
        return self.filename
