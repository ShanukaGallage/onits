# OnIts - Project Management System

## Project Overview

OnIts is a comprehensive, full-stack Project Management and Task Tracking system designed to facilitate seamless collaboration across distributed teams. The system provides secure role-based access control (Admin, Project Manager, Collaborator), real-time task updates via WebSockets, and dynamic Kanban and Table layouts for efficient project execution.

## Technologies & Frameworks

**Frontend:**

- React 18
- Vite
- Tailwind CSS
- Shadcn UI (Radix Primitives)
- React Query (Data Fetching & Caching)
- React Hook Form + Zod (Validation)
- Socket.IO Client (Real-time updates)

**Backend:**

- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon Cloud)
- Socket.IO (WebSockets)
- JWT (Authentication)
- Bcryptjs (Password Hashing)
- Swagger / OpenAPI (Documentation)

**Infrastructure:**

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Azure Web App for Containers (Backend Hosting)
- Azure Static Web Apps (Frontend Hosting)

## Setup & Local Installation

### Prerequisites

- Docker and Docker Compose installed on your local machine.
- Node.js v20+ (optional, if running outside Docker).

### Running with Docker Compose (Recommended)

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/onits.git
   cd onits
   ```

2. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in your database credentials and JWT secret.
   - Copy `frontend/.env.example` to `frontend/.env`.

3. Start the containers:

   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:5000

## API Documentation

All REST API endpoints are fully documented using Swagger / OpenAPI.
Once the backend is running locally, you can access the interactive API explorer at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

## Team Member Contributions

- **Shanuka (Project Coordinator, DevOps Lead & Backend Architect):**
  -
