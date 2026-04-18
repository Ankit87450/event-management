from django.db import models


class Management(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10)
    age = models.IntegerField()
    aadhaar_mobile = models.CharField(max_length=15)
    whatsapp_number = models.CharField(max_length=15)
    attendee_type = models.CharField(max_length=30)
    designation = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    meal_preference = models.CharField(max_length=20)
    parking_facility = models.CharField(max_length=20)
    heard_about = models.CharField(max_length=50, blank=True, null=True)
    special_requirement = models.TextField(blank=True, null=True)
    photo_name = models.CharField(max_length=255, blank=True, null=True)
    photo_base64 = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='REGISTERED')
    meal_taken = models.BooleanField(default=False)
    parking_taken = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_management'

    def __str__(self):
        return f'{self.name} ({self.email})'