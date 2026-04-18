from django.urls import path
from . import views

urlpatterns = [
    path('register/',  views.event_registration, name='register'),
    path('attendee/',  views.attendee_detail,     name='attendee_detail'),
    path('validate/',  views.validate_attendee,   name='validate'),
]