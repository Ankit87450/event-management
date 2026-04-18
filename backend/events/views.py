import re
import base64
import json
import logging
from io import BytesIO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
import qrcode
from .models import Management

logger = logging.getLogger(__name__)

ATTENDEE_TYPES  = ['student', 'retired', 'working_professional']
GENDER_CHOICES  = ['male', 'female']
MEAL_CHOICES    = ['veg', 'non_veg']
PARKING_CHOICES = ['yes', 'no']
MOBILE_RE       = re.compile(r'^[6-9]\d{9}$')


def _generate_qr(user, base_url='http://localhost:8000'):
    """Generate vCard QR code with embedded attendee URL."""
    parts = (user.name or '').strip().split(' ', 1)
    first = parts[0]
    last  = parts[1] if len(parts) > 1 else ''
    mobile = (user.aadhaar_mobile or '').strip()
    if mobile and not mobile.startswith('+'):
        mobile = '+91' + mobile

    attendee_url = f'{base_url}/api/attendee/?id={user.id}'

    vcard = (
        'BEGIN:VCARD\r\n'
        'VERSION:3.0\r\n'
        f'N:{last};{first};;;\r\n'
        f'FN:{user.name or ""}\r\n'
        f'EMAIL;TYPE=INTERNET:{user.email or ""}\r\n'
        f'TEL;TYPE=CELL:{mobile}\r\n'
        f'ORG:{user.company or ""}\r\n'
        f'TITLE:{user.designation or ""}\r\n'
        f'NOTE:Event: Pre AI Summit | Type: {user.attendee_type or ""}\r\n'
        f'URL:{attendee_url}\r\n'
        'END:VCARD\r\n'
    )

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=4,
    )
    qr.add_data(vcard)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buf = BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()


@csrf_exempt
@require_http_methods(['POST'])
def event_registration(request):
    logger.info('Registration request received')
    try:
        name             = request.POST.get('name', '').strip()
        email            = request.POST.get('email', '').strip().lower()
        gender           = request.POST.get('gender', '')
        age              = request.POST.get('age', '')
        attendee_type    = request.POST.get('attendee_type', '')
        designation      = request.POST.get('designation', '').strip() or None
        company          = request.POST.get('company', '').strip() or None
        state            = request.POST.get('state', '')
        aadhaar_mobile   = request.POST.get('aadhaar_mobile', '')
        whatsapp_number  = request.POST.get('whatsapp_number', '')
        meal_preference  = request.POST.get('meal_preference', '')
        parking_facility = request.POST.get('parking_facility', '')
        heard_about      = request.POST.get('heard_about', '') or None
        special_req      = request.POST.get('special_requirement', '').strip() or None
        photo            = request.FILES.get('photo')

        required = {
            'name': name, 'email': email, 'gender': gender, 'age': age,
            'attendee_type': attendee_type, 'aadhaar_mobile': aadhaar_mobile,
            'whatsapp_number': whatsapp_number, 'meal_preference': meal_preference,
            'parking_facility': parking_facility,
        }
        missing = [k for k, v in required.items() if not v]
        if missing:
            return JsonResponse({'status': False, 'error': f'Missing required fields: {", ".join(missing)}'}, status=400)

        try:
            age = int(age)
            if not (12 <= age <= 65):
                return JsonResponse({'status': False, 'error': 'Age must be between 12 and 65.'}, status=400)
        except ValueError:
            return JsonResponse({'status': False, 'error': 'Age must be a valid number.'}, status=400)

        if attendee_type not in ATTENDEE_TYPES:
            return JsonResponse({'status': False, 'error': 'Invalid attendee type.'}, status=400)
        if gender not in GENDER_CHOICES:
            return JsonResponse({'status': False, 'error': 'Invalid gender value.'}, status=400)
        if meal_preference not in MEAL_CHOICES:
            return JsonResponse({'status': False, 'error': 'Invalid meal preference.'}, status=400)
        if parking_facility not in PARKING_CHOICES:
            return JsonResponse({'status': False, 'error': 'Invalid parking option.'}, status=400)

        if attendee_type == 'working_professional' and (not designation or not company):
            return JsonResponse({'status': False, 'error': 'Designation and company are required for working professionals.'}, status=400)
        if attendee_type != 'working_professional':
            designation = None
            company     = None

        if not MOBILE_RE.match(aadhaar_mobile):
            return JsonResponse({'status': False, 'error': 'Invalid mobile number. Must be a 10-digit Indian number.'}, status=400)
        if not MOBILE_RE.match(whatsapp_number):
            return JsonResponse({'status': False, 'error': 'Invalid WhatsApp number. Must be a 10-digit Indian number.'}, status=400)

        photo_name   = None
        photo_base64 = None
        if photo:
            if photo.size > 2 * 1024 * 1024:
                return JsonResponse({'status': False, 'error': 'Photo size must not exceed 2MB.'}, status=400)
            photo_name   = photo.name
            photo_base64 = base64.b64encode(photo.read()).decode()

        with transaction.atomic():
            event = Management.objects.create(
                name=name, email=email, gender=gender, age=age,
                attendee_type=attendee_type, designation=designation, company=company,
                state=state, aadhaar_mobile=aadhaar_mobile, whatsapp_number=whatsapp_number,
                meal_preference=meal_preference, parking_facility=parking_facility,
                heard_about=heard_about, special_requirement=special_req,
                photo_name=photo_name, photo_base64=photo_base64,
                status='REGISTERED',
            )

        base_url = request.build_absolute_uri('/').rstrip('/')
        qr_b64 = _generate_qr(event, base_url)
        logger.info(f'Registration successful: ID={event.id}, email={email}')

        return JsonResponse({
            'status': True,
            'message': 'Registration successful.',
            'registration_id': event.id,
            'qr_base64': qr_b64,
        }, status=200)

    except Exception:
        logger.exception('Registration error')
        return JsonResponse({'status': False, 'error': 'An unexpected server error occurred. Please try again.'}, status=500)


@csrf_exempt
@require_http_methods(['GET'])
def attendee_detail(request):
    user_id = (request.GET.get('id') or '').strip()
    if not user_id:
        return JsonResponse({'status': False, 'error': 'Attendee ID is required.'}, status=400)

    user = Management.objects.filter(id=user_id).first()
    if not user:
        return JsonResponse({'status': False, 'error': 'Attendee not found.'}, status=404)

    mobile = (user.aadhaar_mobile or '').strip()
    if mobile and not mobile.startswith('+'):
        mobile = '+91' + mobile

    return JsonResponse({
        'status': True,
        'data': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'mobile': mobile,
            'whatsapp_number': user.whatsapp_number,
            'gender': user.gender,
            'age': user.age,
            'attendee_type': user.attendee_type,
            'designation': user.designation,
            'company': user.company,
            'state': user.state,
            'meal_preference': user.meal_preference,
            'parking_facility': user.parking_facility,
            'heard_about': user.heard_about,
            'special_requirement': user.special_requirement,
            'registration_status': user.status,
            'photo_base64': user.photo_base64,
            'created_at': user.created_at.isoformat(),
        }
    })


@csrf_exempt
@require_http_methods(['POST'])
def validate_attendee(request):
    try:
        data    = json.loads(request.body)
        user_id = data.get('id')
        if not user_id:
            return JsonResponse({'status': False, 'error': 'Attendee ID is required.'}, status=400)

        user = Management.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'status': False, 'error': 'Attendee not found.'}, status=404)

        if user.status == 'VALIDATED':
            return JsonResponse({'status': False, 'error': 'Attendee has already been validated.'}, status=409)

        user.status = 'VALIDATED'
        user.save()
        logger.info(f'Attendee validated: ID={user_id}')
        return JsonResponse({'status': True, 'message': 'Attendee validated successfully.'})

    except Exception:
        logger.exception('Validation error')
        return JsonResponse({'status': False, 'error': 'An unexpected server error occurred.'}, status=500)
