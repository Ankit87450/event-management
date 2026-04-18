from django.db import models

class Management(models.Model):
    name            = models.CharField(max_length=200, null=True, blank=True)
    email           = models.EmailField(null=True, blank=True)
    gender          = models.CharField(max_length=10, null=True, blank=True)
    age             = models.IntegerField(null=True, blank=True)
    attendee_type   = models.CharField(max_length=50, null=True, blank=True)
    designation     = models.CharField(max_length=200, null=True, blank=True)
    company         = models.CharField(max_length=200, null=True, blank=True)
    state           = models.CharField(max_length=100, null=True, blank=True)
    aadhaar_mobile  = models.CharField(max_length=15, null=True, blank=True)
    whatsapp_number = models.CharField(max_length=15, null=True, blank=True)
    meal_preference = models.CharField(max_length=20, null=True, blank=True)
    parking_facility= models.CharField(max_length=5, null=True, blank=True)
    heard_about     = models.CharField(max_length=100, null=True, blank=True)
    special_requirement = models.TextField(null=True, blank=True)
    photo_name      = models.CharField(max_length=255, null=True, blank=True)
    photo_base64    = models.TextField(null=True, blank=True)
    status          = models.CharField(max_length=50, default='REGISTERED')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.status})"

    class Meta:
        db_table = 'event_management'
        ordering = ['-created_at']
