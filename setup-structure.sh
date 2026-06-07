#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  OnIts — Monorepo Folder Structure Setup Script
ore pushing to GitHub so teammates pull a ready structure.
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately if any command fails

echo ""
echo "  ___        ___ _         "
echo " / _ \\ _ __ |_ _| |_ ___  "
echo "| | | | '_ \\ | || __/ __| "
echo "| |_| | | | || || |_\\__ \\ "
echo " \\___/|_| |_|___\\__|___/ "
echo ""
echo "🚀 Scaffolding OnIts monorepo structure..."
echo ""

# ── Backend Directories ───────────────────────────────────────────────────────
echo "📁 Creating backend structure..."
mkdir -p backend/prisma/migrations
mkdir -p backend/src/config
mkdir -p backend/src/controllers
mkdir -p backend/src/middleware
mkdir -p backend/src/routes
mkdir -p backend/src/services
mkdir -p backend/src/validators
mkdir -p backend/src/utils
mkdir -p backend/src/socket
mkdir -p backend/src/types

# ── Frontend Directories ──────────────────────────────────────────────────────
echo "📁 Creating frontend structure..."
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/features/auth
mkdir -p frontend/src/features/projects
mkdir -p frontend/src/features/tasks
mkdir -p frontend/src/hooks
mkdir -p frontend/src/lib
mkdir -p frontend/src/pages
mkdir -p frontend/src/types
mkdir -p frontend/public

# ── GitHub Actions ────────────────────────────────────────────────────────────
echo "📁 Creating CI/CD structure..."
mkdir -p .github/workflows

# ── .gitkeep placeholders ─────────────────────────────────────────────────────
# Git does not track empty directories — .gitkeep files ensure the structure
# is committed and teammates get the full skeleton when they clone
echo "📌 Adding .gitkeep placeholders to empty directories..."
find . -type d -empty \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -exec touch {}/.gitkeep \;

echo ""
echo "✅ Folder structure created successfully!"
echo ""
echo "────────────────────────────────────────────────────────────"
echo "  NEXT STEPS (do these in order):"
echo "────────────────────────────────────────────────────────────"
echo ""
echo "  1. Place the downloaded files:"
echo "     schema.prisma   →  backend/prisma/schema.prisma"
echo "     db.ts           →  backend/src/config/db.ts"
echo "     docker-compose.yml  →  (repo root)"
echo "     package.json    →  (repo root)"
echo "     backend.Dockerfile  →  backend/Dockerfile"
echo "     frontend.Dockerfile →  frontend/Dockerfile"
echo "     nginx.conf      →  frontend/nginx.conf"
echo "     .cursorrules    →  (repo root)"
echo "     .env.example    →  backend/.env.example"
echo ""
echo "  2. Create backend/.env from the template:"
echo "     cp backend/.env.example backend/.env"
echo "     (Then fill in your Neon password and JWT secret)"
echo ""
echo "  3. Run the first Prisma migration:"
echo "     cd backend && npx prisma migrate dev --name init"
echo ""
echo "  4. Open Prisma Studio to verify the DB:"
echo "     npx prisma studio"
echo ""
echo "  5. Commit everything:"
echo "     git add ."
echo "     git commit -m 'chore: scaffold monorepo structure and prisma schema'"
echo "     git push origin main"
echo ""
echo "────────────────────────────────────────────────────────────"
