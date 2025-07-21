# MedVault: Healthcare Document Management PoC

MedVault is a simple, full-stack proof-of-concept for uploading and managing medical documents. It uses React (Vite, Material UI) for the frontend, Django REST Framework for the backend, PostgreSQL for storage, and Docker Compose for easy local setup.

## Quick Start

1. Clone the repo and start everything with Docker Compose:
   ```sh
   git clone https://github.com/shivateja9090/INI8Labs_assignment.git
   cd INI8Labs_assignment
   docker compose up --build
   ```
2. Open:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend/API: [http://localhost:8000](http://localhost:8000)
   - Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

## Login
- The admin user is created automatically on first run (see `docker-compose.yml` for credentials, default: `testuser` / `testpass`).
- Log in via the UI or `/login/` endpoint to get a JWT token.

## API Endpoints
- `POST   /login/` (JSON: username, password → JWT)
- `POST   /documents/upload/` (PDF upload, JWT required)
- `GET    /documents/` (list, JWT required)
- `GET    /documents/<id>/download/` (download, JWT required)
- `DELETE /documents/<id>/` (delete, JWT required)

Example login with curl:
```sh
curl -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}' http://localhost:8000/login/
```

## Development
- Frontend: `cd medvault_frontend && npm run dev`
- Backend: `cd medvault_backend && source venv/bin/activate && python manage.py runserver`
- Run backend tests: `cd medvault_backend && source venv/bin/activate && pytest documents/tests.py`

## Notes
- CORS is enabled for local dev.
- Uploaded files are stored in a Docker volume.
- You can manage users and documents in the Django admin.


