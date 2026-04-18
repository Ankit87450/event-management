from django.contrib import admin
from .models import Management

@admin.register(Management)
class ManagementAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'email', 'attendee_type', 'status', 'created_at']
    list_filter   = ['status', 'attendee_type', 'meal_preference', 'parking_facility']
    search_fields = ['name', 'email', 'aadhaar_mobile']
    readonly_fields = ['created_at', 'updated_at']
