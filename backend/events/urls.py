from django.urls import path
from . import views

urlpatterns = [
    path('register/',  views.event_registration, name='register'),
    path('qr/',        views.generate_public_qr,  name='generate_qr'),
    path('attendee/',  views.attendee_detail,      name='attendee_detail'),
    path('validate/',  views.validate_attendee,    name='validate'),
]
