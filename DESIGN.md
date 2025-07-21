# MedVault: System Design & Architecture

## 1. Tech Stack & Architecture
- **Frontend:** React (Vite, Material UI)
- **Backend:** Django + Django REST Framework (Python)
- **Database:** PostgreSQL (Dockerized)
- **File Storage:** Local disk (Docker volume)
- **Containerization:** Docker Compose

### High-Level Architecture
```
[Frontend (React)]
      |
      v
[Backend API (Django)]
   +----+----+
   |         |
[PostgreSQL] [File Storage]
```

### Key Components
- **Frontend:** File upload, list, download, delete UI (Material UI)
- **Backend:** REST API, file validation, metadata storage, file serving
- **DB:** Stores file metadata (filename, path, patient_id, size, date)
- **File Storage:** Stores PDFs (not exposed directly)
- **Admin User Creation:** Robust, automatic admin user creation using a custom Django management command and environment variables in `docker-compose.yml` (recommended for onboarding and CI/CD)

## 2. Data Flow
- **Upload:** Frontend → API (multipart) → Validate & store file → Save metadata in DB
- **List:** Frontend → API (GET) → Return metadata list
- **Download:** Frontend → API (GET) → Stream file
- **Delete:** Frontend → API (DELETE) → Remove file & metadata

## 3. API Specification
- `POST   /login/` (JSON: username, password → returns JWT access token)
- `POST   /documents/upload/` (multipart/form-data: file, patient_id, JWT required)
- `GET    /documents/` (list all documents, JWT required)
- `GET    /documents/<id>/download/` (download PDF, JWT required)
- `DELETE /documents/<id>/` (delete document, JWT required)

## 4. Key Considerations
- **Scalability:** Can scale horizontally; file storage can move to S3/minio
- **File Storage:** Local disk for PoC; S3/minio for production
- **Error Handling:** 404 for missing files, 400 for invalid files
- **Security:** PDF validation, JWT auth, no real file paths exposed
- **Onboarding:** Admin user is created automatically on first run using environment variables and a custom management command

## 5. CI/CD Pipeline
- **Build:** Lint, type-check, build Docker images
- **Test:** Run backend unit tests
- **Lint:** ESLint/flake8
- **Artifact Validation:** Ensure images build and run
- **Onboarding:** Admin user creation is automated for CI/CD and local dev

## 6. Infrastructure as Code (IaC)
- See `docker-compose.yml`, `Dockerfile` in each service
- File storage mounted as Docker volume
- Admin user creation is handled by a custom management command in the backend service

## 7. Design Justification
- **File Storage:** Local disk is simple for PoC, easy to mount in Docker, can be swapped for S3/minio
- **HIPAA Compliance:** Would require encrypted storage, audit logs, strict access controls, encrypted DB, secure backups
- **Antivirus:** Integrate ClamAV or similar; scan files on upload before saving/serving
- **Admin User Creation:** Using a custom management command and environment variables is robust, repeatable, and works for onboarding, CI/CD, and local development 