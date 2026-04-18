from django.contrib import admin
from .models import Management

@admin.register(Management)
class ManagementAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'mobile', 'registration_status', 'meal_taken', 'parking_taken']
    list_filter = ['registration_status', 'meal_taken', 'parking_taken', 'attendee_type']
    search_fields = ['name', 'email', 'mobile']
    readonly_fields = ['id', 'created_at']