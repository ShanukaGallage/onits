# OnIts

OnIts is a full-stack task and project management platform for teams.

**Production:** https://www.onits.app

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Realtime:** Socket.IO

## Repository Structure

- `/frontend` – React SPA (Vite)
- `/backend` – Express API + Prisma
- `/docker-compose.yml` – local Docker development setup

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (optional, recommended for local containerized dev)

## Environment Setup

### Backend

1. Copy:
   ```bash
   cp /home/runner/work/onits/onits/backend/.env.example /home/runner/work/onits/onits/backend/.env
   ```
2. Fill required values in `/home/runner/work/onits/onits/backend/.env`:
   - `DATABASE_URL` (Neon pooler URL)
   - `DIRECT_URL` (Neon direct URL for migrations)
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - mail/test SMTP variables

### Frontend

Create `/home/runner/work/onits/onits/frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

### Option 1: Docker Compose

```bash
cd /home/runner/work/onits/onits
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API docs: http://localhost:5000/api/docs

### Option 2: Native (without Docker)

```bash
cd /home/runner/work/onits/onits
npm install
```

Start backend:

```bash
npm run dev --workspace=backend
```

Start frontend (new terminal):

```bash
npm run dev --workspace=frontend
```

## Useful Commands

From repository root (`/home/runner/work/onits/onits`):

```bash
npm run dev:native
npm run build --workspace=backend
npm run build --workspace=frontend
npm run lint --workspace=frontend
```

## Security & Architecture Notes

- Authentication uses JWT in HttpOnly cookies.
- Backend uses Prisma (no raw SQL).
- Frontend API requests should go through the centralized Axios client.

## License

Private project.
