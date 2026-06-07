# ─────────────────────────────────────────────────────────────────────────────
#  OnIts — Frontend Dockerfile (Multi-stage)
#  Owner: Shanuka (DevOps Lead)
#
#  STAGE STRATEGY:
#  • base        — installs dependencies
#  • development — runs Vite dev server with HMR (used by docker-compose.yml)
#  • builder     — compiles React SPA to /dist (static HTML/CSS/JS)
#  • production  — Nginx serves the static build (no Node.js needed at runtime)
#
#  WHY NGINX IN PRODUCTION:
#  Nginx is far more efficient than Vite's dev server for serving static files.
#  It also handles React Router correctly via try_files (serves index.html for
#  all routes so client-side routing works after a hard refresh or direct URL).
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Base dependencies ────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Development (Vite HMR) ──────────────────────────────────────────
FROM base AS development
COPY . .
EXPOSE 5173
# --host 0.0.0.0 makes Vite's dev server accessible OUTSIDE the container
# (required so your browser on the host machine can reach localhost:5173)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Stage 3: Production build ─────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npm run build

# ── Stage 4: Production (Nginx static serve) ──────────────────────────────────
FROM nginx:alpine AS production

# Copy the built SPA into the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx config (handles React Router + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
