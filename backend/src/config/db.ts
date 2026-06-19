import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * WHY THIS EXISTS:
 * Node.js hot-reload (ts-node-dev / tsx --watch) re-evaluates module files on every
 * change. Without this pattern, each reload creates a NEW PrismaClient, opening a new
 * connection pool to Neon. In development you would quickly exhaust Neon's connection
 * limit (typically 100 for the free tier). This pattern stores the single instance on
 * `globalThis` which survives hot-reloads, ensuring one client per process.
 *
 * In production, this module is evaluated once and the singleton is reused for the
 * lifetime of the container — no special handling needed.
 *
 * Reference: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─────────────────────────────────────────────────────────────────────────────
//  safeUserSelect
// ─────────────────────────────────────────────────────────────────────────────
/**
 * A structural security mask that permanently excludes `passwordHash` from any
 * Prisma query result at the ORM level — not at the serialization layer.
 *
 * WHY THIS IS BETTER THAN DELETING THE FIELD IN A RESPONSE OBJECT:
 * If you do `const user = await prisma.user.findUnique(...)` and then
 * `delete user.passwordHash`, the hash was still fetched from the DB and held
 * in memory. With `select: safeUserSelect`, Prisma never fetches the column
 * at all — the hash never enters the process memory of this request.
 *
 * USAGE — import and apply to every query that returns user data to the client:
 *
 *   const user = await prisma.user.findUnique({
 *     where: { id },
 *     select: safeUserSelect,
 *   });
 *
 * The `satisfies Prisma.UserSelect` guarantees TypeScript catches any typo
 * or field drift — if you rename a model field in schema.prisma, the compiler
 * will error here until this object is updated.
 */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  role: true,
  status: true,
  isFirstLogin: true,
  createdAt: true,
  updatedAt: true,
  // passwordHash: intentionally OMITTED — never add it here
} satisfies Prisma.UserSelect;

/**
 * SafeUser type — the shape of a user object safe to include in API responses.
 * Import this type in controllers and services to ensure type safety end-to-end.
 *
 * USAGE:
 *   import type { SafeUser } from "../config/db";
 *   function buildUserResponse(user: SafeUser) { ... }
 */
export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
