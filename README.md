# MedVault: Healthcare Document Management PoC

## Overview
MedVault is a full-stack proof-of-concept for secure healthcare document management. Patients and clinicians can upload, view, download, and delete PDF medical records. The system uses a React (Vite, Material UI) frontend, Django REST backend, PostgreSQL, and Docker Compose for orchestration.

## Features
- JWT authentication (login required for all API actions)
- Upload PDF files (max 10MB) linked to a patient ID
- List, download, and delete uploaded documents
- File validation (PDF only, size limit)
- RESTful API with metadata storage in PostgreSQL
- Material UI-based frontend
- Dockerized for easy local setup

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev, optional)
- Python 3.10+ (for local backend dev, optional)

### Quick Start (Docker Compose)
```sh
git clone <repo-url>
cd <repo-dir>
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin

### Local Development
- Frontend: `cd medvault_frontend && npm run dev`
- Backend: `cd medvault_backend && source venv/bin/activate && python manage.py runserver`

### Running Tests
- Backend: `cd medvault_backend && source venv/bin/activate && pytest documents/tests.py`

## Authentication & Admin User Creation
- **Login required for all API endpoints.**
- **Admin user is created automatically on first run** using environment variables in `docker-compose.yml`:
  - `DJANGO_SUPERUSER_USERNAME: testuser`
  - `DJANGO_SUPERUSER_EMAIL: testuser@example.com`
  - `DJANGO_SUPERUSER_PASSWORD: testpass`
- Login at the UI or via `/login/` endpoint to get a JWT token.
- Use the Django admin at `/admin` with the same credentials.

## API Endpoints
- `POST   /login/` (JSON: username, password → returns JWT access token)
- `POST   /documents/upload/` (multipart/form-data: file, patient_id, JWT required)
- `GET    /documents/` (list all documents, JWT required)
- `GET    /documents/<id>/download/` (download PDF, JWT required)
- `DELETE /documents/<id>/` (delete document, JWT required)

## CORS
- CORS is enabled for all origins for development. The frontend can communicate with the backend API.

## Assumptions
- Mock patient IDs are used (no real user auth for PoC)
- Files are stored on a Docker volume (local disk)
- No real email or SMS notifications

## Example cURL
```sh
# Login (get JWT)
curl -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}' http://localhost:8000/login/
# Use the returned access token for all other requests:
# List documents
curl -H "Authorization: Bearer <access_token>" http://localhost:8000/documents/
# Upload
token=<access_token>
curl -H "Authorization: Bearer $token" -F "file=@test.pdf" -F "patient_id=123" http://localhost:8000/documents/upload/
# Download
curl -H "Authorization: Bearer $token" -OJ http://localhost:8000/documents/1/download/
# Delete
curl -H "Authorization: Bearer $token" -X DELETE http://localhost:8000/documents/1/
```

## Screenshots

