# MedVault: System Design & Architecture

## Stack & Architecture
- **Frontend:** React (Vite, Material UI)
- **Backend:** Django REST Framework
- **Database:** PostgreSQL (Docker)
- **File Storage:** Local disk (Docker volume)
- **Orchestration:** Docker Compose

### Architecture Overview
Frontend (React) talks to Backend (Django REST API), which stores metadata in PostgreSQL and files on disk. Everything runs in Docker containers for easy local setup. The frontend handles JWT login and stores the token in localStorage, sending it with all API requests.

## Data Flow
- User logs in (JWT auth, token stored in browser)
- Uploads PDF (frontend → backend → disk, metadata in DB)
- Backend validates file type and size (PDF, max 10MB)
- User can list, download, or delete their documents
- All API calls require a valid JWT in the Authorization header

## API
- `/login/` (POST, username/password → JWT)
- `/documents/upload/` (POST, PDF, JWT required)
- `/documents/` (GET, JWT required)
- `/documents/<id>/download/` (GET, JWT required)
- `/documents/<id>/` (DELETE, JWT required)

## Security & Onboarding
- All endpoints require JWT auth (handled in frontend and backend)
- Only PDFs allowed, max 10MB (checked in backend)
- Admin user is created automatically on first run using a custom Django management command and environment variables in Docker Compose. This makes onboarding and CI/CD easy—no manual user creation needed.

## Error Handling & Extensibility
- Backend returns clear error messages for invalid files, missing JWT, or unauthorized actions
- Frontend shows user-friendly messages and loading states
- Stack is easy to extend: swap local disk for S3, add Redis, or use a production DB with minimal changes

## Dev & CI/CD
- All services run in Docker Compose
- Backend runs migrations and creates admin user on startup
- Tests can be run with `pytest`
- The admin user creation command is run automatically in CI/CD and local dev

## Why this approach?
- Docker Compose makes onboarding and local dev easy
- JWT auth is simple and works for both UI and API
- Custom management command for admin user is robust and works in CI/CD
- Stack is easy to extend for real-world needs (S3, Redis, etc.)

---
If you want to extend or deploy this, just add a real user model, S3 storage, or production DB as needed. The codebase is intentionally simple and easy to adapt. 