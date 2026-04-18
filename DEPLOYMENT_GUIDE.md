# Event Management System — Deployment Guide

## Project Structure

```
event_management/
├── backend/         ← Django REST API
└── frontend/        ← React Web App
```

---

## LOCAL DEVELOPMENT

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup
```bash
cd frontend
npm install
# Edit .env → set REACT_APP_API_URL=http://localhost:8000/api
npm start
```

---

## PRODUCTION DEPLOYMENT

### Step 1 — Deploy Backend on Railway.app (Free)

1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo → choose the `backend/` folder as root
4. Railway auto-detects Python and runs gunicorn via Procfile

**Set these Environment Variables in Railway dashboard:**

| Variable | Value |
|----------|-------|
| `DJANGO_SECRET_KEY` | `your-very-long-random-secret-key-here` |
| `ALLOWED_HOSTS` | `your-app.railway.app` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `DEBUG` | `False` |

**After deploy, run migrations:**
In Railway dashboard → your service → Shell tab:
```bash
python manage.py migrate
python manage.py createsuperuser
```

Your backend URL: `https://your-app.railway.app`

---

### Step 2 — Deploy Frontend on Vercel (Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import your repo
3. Set Root Directory to `frontend/`
4. Add Environment Variable:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-app.railway.app/api` |

5. Click Deploy

Your frontend URL: `https://your-project.vercel.app`

---

### Step 3 — Update CORS on Backend

After getting your Vercel URL, update Railway environment variable:
```
CORS_ALLOWED_ORIGINS = https://your-project.vercel.app
```

Redeploy backend. Done!

---

## GENERATE A SECRET KEY

Run this in Python to generate a secure secret key:
```python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register new attendee |
| GET | `/api/attendee/?id=X` | Get attendee details |
| POST | `/api/validate/` | Validate/check-in attendee |
| GET | `/api/health/` | Health check |
| GET | `/admin/` | Django admin panel |

---

## SCANNER APP (Flutter)

After backend is live, update the API URL in the Flutter scanner app:
- Open the app → Settings (gear icon) → Enter: `https://your-app.railway.app/api`
- Save and scan!
