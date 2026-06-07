# ─────────────────────────────────────────────────────────────────────────────
#  OnIts — Backend Dockerfile (Multi-stage)
#  Owner: Shanuka (DevOps Lead)
#
#  STAGE STRATEGY:
#  • base        — installs dependencies (shared by all other stages)
#  • development — runs ts-node-dev for hot-reload (used by docker-compose.yml)
#  • builder     — compiles TypeScript to /dist
#  • production  — minimal Alpine image with only the compiled output
#
#  WHY MULTI-STAGE:
#  The production image never contains TypeScript source, ts-node-dev, or devDependencies.
#  This shrinks the final image significantly and reduces the attack surface.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Base dependencies ────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# `npm ci` is used instead of `npm install` — it installs exact versions from
# package-lock.json (reproducible builds, no version drift in production)
RUN npm ci

# ── Stage 2: Development (hot-reload) ─────────────────────────────────────────
FROM base AS development
COPY . .
# Generate Prisma Client types — must run AFTER copying prisma/schema.prisma
# This generates TypeScript types used by all Prisma queries
RUN npx prisma generate
EXPOSE 5000
# ts-node-dev / tsx --watch restarts the process when TypeScript files change
CMD ["npm", "run", "dev"]

# ── Stage 3: TypeScript builder ───────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 4: Production (minimal footprint) ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Copy only what is needed to run the compiled application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Re-generate Prisma Client for the production Alpine environment
# (the generated client contains native binaries that are OS-specific)
RUN npx prisma generate

EXPOSE 5000
CMD ["node", "dist/server.js"]
