# ─────────────────────────────────────────────────────────────────────────────

# OnIts — Cursor IDE Rules

# Place this at the REPOSITORY ROOT as: .cursorrules

# Project: Task Management System | https://onits.app

# Stack: Node.js + Express + Prisma + PostgreSQL | React + Vite + TypeScript

# ─────────────────────────────────────────────────────────────────────────────

## PROJECT OVERVIEW

This is a TypeScript monorepo:

- /backend → Node.js + Express API running on port 5000
- /frontend → React 18 + Vite SPA running on port 5173
- Database → Neon PostgreSQL (Prisma ORM, schema in /backend/prisma/schema.prisma)

---

## 🗄️ DATABASE RULES — Owner: Shanuka

- Primary keys MUST be `String @id @default(uuid())` — integer autoincrements are BANNED (anti-IDOR)
- NEVER include `passwordHash` in any Prisma query or API response
- ALWAYS use `safeUserSelect` from `/backend/src/config/db.ts` for user queries
- Schema changes require Shanuka's review before touching schema.prisma
- Migrations run via `npx prisma migrate dev` — manual SQL edits to Neon are FORBIDDEN
- Use DATABASE_URL (pooler) for queries, DIRECT_URL for migrations only

---

## 🔐 BACKEND SECURITY — Owner: Poojani

- JWT tokens MUST be stored in HttpOnly, SameSite=Strict cookies ONLY
- localStorage / sessionStorage for tokens is ABSOLUTELY BANNED (XSS vulnerability)
- Every protected route MUST be guarded by `authenticate` from middleware/authenticate.ts
- Role-based access MUST use `authorize` from middleware/authorize.ts
- NEVER write raw SQL — all DB access goes through Prisma parameterized queries
- CORS must only allow the FRONTEND_URL environment variable, never wildcard (\*) in production

---

## ⚙️ BACKEND SERVICES — Owner: Sajana

- ALL request bodies MUST pass through a Zod validator from /backend/src/validators/ first
- Business logic and Prisma queries live in /backend/src/services/ ONLY
- Controllers are thin — they call service functions and return HTTP responses, nothing else
- Email sending logic lives in /backend/src/utils/mailer.ts
- Cron jobs live in /backend/src/utils/cron.ts and register in server.ts

---

## 🎨 FRONTEND ARCHITECTURE — Owner: Aradhana

- The Axios instance in /frontend/src/lib/axios.ts MUST have `withCredentials: true`
- ALL API calls go through the centralized Axios instance — raw fetch() calls are BANNED
- Protected routes use auth guard components from /frontend/src/components/layout/
- Global styles and Tailwind tokens live in /frontend/src/index.css
- Never hardcode API URLs — use the VITE_API_URL environment variable

---

## ⚡ FRONTEND FEATURES — Owner: Tharushan

- Feature code lives inside /frontend/src/features/tasks/ and /frontend/src/features/projects/
- ALL server state is managed through TanStack Query (React Query v5) — no useEffect fetch calls
- Drag-and-drop ONLY uses @dnd-kit/core — no other DnD libraries
- Real-time Socket.io logic lives in dedicated custom hooks inside features/

---

## 🚫 GLOBAL RULES — Applies to ALL team members

- NEVER commit .env files — secrets go to Doppler
- NEVER push directly to main — always use feature branches with Pull Requests
- Branch naming: feature/_, fix/_, chore/_, docs/_
- Commit format: feat|fix|chore|docs: short description (conventional commits)
- Never mix UI formatting code into backend controllers
- Never write Prisma queries directly in frontend components
- TypeScript strict mode is ON — never use `any` type unless absolutely unavoidable
- All API error responses must use the standard structure: { error: string, message: string }
