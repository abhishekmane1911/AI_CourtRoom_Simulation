from django.db import models

class Case(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="active")
    current_phase = models.CharField(max_length=20, default="opening")
    
    def __str__(self):
        return self.name

class CaseLog(models.Model):
    case_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    message = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    phase = models.CharField(max_length=20, default="opening")
    
    def __str__(self):
        return f"{self.case_name} - {self.role} - {self.timestamp}"

