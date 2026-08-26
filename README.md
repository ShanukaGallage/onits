# OnIts

OnIts is a full-stack task and project management platform built for collaborative teams.

- **Production**: https://www.onits.app
- **Monorepo**: React frontend + Express backend + Prisma/PostgreSQL

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
  - [Option A: Native](#option-a-native)
  - [Option B: Docker Compose](#option-b-docker-compose)
- [Database & Prisma](#database--prisma)
- [Available Commands](#available-commands)
- [API Surface](#api-surface)
- [Authentication & Authorization](#authentication--authorization)
- [Realtime & Background Jobs](#realtime--background-jobs)
- [Development Conventions](#development-conventions)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

OnIts helps teams plan and execute work through projects, task boards, user management, team messaging, and notifications.

The codebase is organized as a TypeScript monorepo with:

- `/backend` → Express API + Prisma ORM
- `/frontend` → React (Vite) single-page application
- `Neon PostgreSQL` as the database

## Core Capabilities

- JWT cookie-based authentication with refresh token rotation
- Role-aware access control (`Admin`, `ProjectManager`, `Collaborator`)
- Project creation, membership management, and project detail views
- Task workflows with status, priority, assignment, and due dates
- Task comments and file attachments
- Inbox channels and messages
- Notification system (including read/unread flows)
- Realtime updates via Socket.IO
- Swagger API docs for backend routes

## Tech Stack

### Frontend

- React + TypeScript + Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- `@dnd-kit` for drag-and-drop interactions
- Socket.IO client

### Backend

- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Zod validation
- JWT auth in HttpOnly cookies
- Socket.IO
- Nodemailer
- Swagger (OpenAPI docs)

## Repository Structure

```text
onits/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── socket/
│       ├── utils/
│       └── validators/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js **20+**
- npm **10+**
- A Neon PostgreSQL database
- Docker + Docker Compose (optional)

## Environment Variables

### Backend (`/backend/.env`)

Copy the template:

```bash
cp /home/runner/work/onits/onits/backend/.env.example /home/runner/work/onits/onits/backend/.env
```

Key values used by the backend:

- `DATABASE_URL` (Neon pooler URL for runtime queries)
- `DIRECT_URL` (Neon direct URL for Prisma migrations)
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`
- `FRONTEND_URL`
- SMTP/Testmail variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TESTMAIL_NAMESPACE`, etc.)

> Keep `.env` local only. Never commit secrets.

### Frontend (`/frontend/.env`)

Create `/home/runner/work/onits/onits/frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

### Option A: Native

1. Install dependencies from repository root:

```bash
cd /home/runner/work/onits/onits
npm install
```

2. Generate Prisma client:

```bash
cd /home/runner/work/onits/onits/backend
npx prisma generate
```

3. Run migrations:

```bash
cd /home/runner/work/onits/onits/backend
npx prisma migrate dev
```

4. (Optional) seed initial users:

```bash
cd /home/runner/work/onits/onits/backend
npx prisma db seed
```

5. Start both apps from root:

```bash
cd /home/runner/work/onits/onits
npm run dev:native
```

Or run separately:

```bash
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

Local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger docs: http://localhost:5000/api/docs
- Health check: http://localhost:5000/health

### Option B: Docker Compose

```bash
cd /home/runner/work/onits/onits
docker-compose up --build
```

This starts:

- `onits_backend` on `5000`
- `onits_frontend` on `5173`

The compose setup uses bind mounts for hot reload and connects to Neon (no local DB container).

## Database & Prisma

- Prisma schema: `/home/runner/work/onits/onits/backend/prisma/schema.prisma`
- All primary keys are UUID strings (`String @id @default(uuid())`)
- `passwordHash` should never be exposed in API responses
- User queries are expected to use `safeUserSelect` (`/backend/src/config/db.ts`)

Typical Prisma commands:

```bash
cd /home/runner/work/onits/onits/backend
npx prisma generate
npx prisma migrate dev
npx prisma studio
npx prisma db seed
```

## Available Commands

### Root (`/home/runner/work/onits/onits/package.json`)

```bash
npm run install:all
npm run dev:native
```

### Backend (`/home/runner/work/onits/onits/backend/package.json`)

```bash
npm run dev --workspace=backend
npm run build --workspace=backend
npm run start --workspace=backend
```

### Frontend (`/home/runner/work/onits/onits/frontend/package.json`)

```bash
npm run dev --workspace=frontend
npm run build --workspace=frontend
npm run lint --workspace=frontend
npm run preview --workspace=frontend
```

## API Surface

The backend exposes API routes under `/api`:

- `/api/auth` → login/logout/refresh/current-user/password change
- `/api/users` → user management and profile operations
- `/api/projects` → project CRUD + membership management
- `/api/tasks` → task CRUD + assignment operations
- `/api/tasks/:taskId/comments` → task comments
- `/api/tasks/:taskId/attachments` → task file attachments
- `/api/channels` → inbox channels
- `/api/channels/:channelId/messages` → channel messages
- `/api/notifications` → notification read/read-all flows

Live API docs: `GET /api/docs`

## Authentication & Authorization

- Access and refresh tokens are issued as **HttpOnly cookies**
- Frontend Axios client is configured with `withCredentials: true`
- Automatic refresh flow is handled by Axios response interceptors
- Protected routes use authentication middleware (`authenticate`)
- Role gating uses authorization middleware (`authorize`) and frontend role routes

## Realtime & Background Jobs

- Socket.IO server initialization: `/backend/src/socket/socket.ts`
- Frontend socket hook: `/frontend/src/hooks/useSocket.ts`
- Scheduled jobs are registered in `/backend/src/utils/cron.ts`

## Development Conventions

- Controllers stay thin; business logic belongs in service layer
- Request validation uses Zod validators
- Frontend API calls should use centralized Axios instance (`/frontend/src/lib/axios.ts`)
- Keep secrets out of source control (`.env` files are ignored)
- Use feature branches and pull requests instead of direct pushes to main

## Troubleshooting

- **CORS errors**: ensure `FRONTEND_URL` matches the frontend origin.
- **401 loops on frontend**: verify cookies are enabled and backend JWT secrets are set.
- **Prisma migration issues**: confirm `DIRECT_URL` is valid and reachable.
- **Socket connection issues**: confirm `VITE_API_URL` points to backend base API and backend server is running.

## License

Private project.
