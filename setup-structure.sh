#!/bin/bash
set -e  # Exit immediately if any command fails

echo "🚀 Scaffolding OnIts decoupled workspace layers..."

# Create backend architecture sub-folders
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

# Create frontend architecture sub-folders
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/features/auth
mkdir -p frontend/src/features/tasks
mkdir -p frontend/src/features/projects
mkdir -p frontend/src/features/comments
mkdir -p frontend/src/features/attachments
mkdir -p frontend/src/features/notifications
mkdir -p frontend/src/hooks
mkdir -p frontend/src/lib
mkdir -p frontend/src/schemas
mkdir -p frontend/src/types
mkdir -p frontend/public

# Programmatically drop hidden trackers to force git to preserve empty directories on GitHub
find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" -exec touch {}/.gitkeep \;

echo "✅ Folder structure created successfully with git preservation marks!"