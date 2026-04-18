from django.db import models

class Management(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10)
    age = models.IntegerField()
    mobile = models.CharField(max_length=15)
    whatsapp_number = models.CharField(max_length=15)
    attendee_type = models.CharField(max_length=30)
    designation = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    meal_preference = models.CharField(max_length=20)
    parking_facility = models.CharField(max_length=20)
    registration_status = models.CharField(max_length=20, default='pending')
    meal_taken = models.BooleanField(default=False)
    parking_taken = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_management'