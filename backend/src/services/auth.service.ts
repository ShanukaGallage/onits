import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma, safeUserSelect, SafeUser } from "../config/db";

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure random refresh token (64 hex bytes)
 * and its bcrypt hash. Only the hash is persisted — the raw token is returned
 * to the caller once and never stored.
 */
async function generateRefreshToken(): Promise<{ raw: string; hash: string }> {
  const raw = crypto.randomBytes(64).toString("hex");
  const hash = await bcrypt.hash(raw, 10);
  return { raw, hash };
}

/**
 * Computes the Date object representing token expiry from an env-var string like "7d".
 */
function parseExpiresIn(expiresIn: string): Date {
  const now = Date.now();
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid REFRESH_TOKEN_EXPIRES_IN value: ${expiresIn}`);
  const [, num, unit] = match;
  const ms = parseInt(num, 10) * { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit as "s" | "m" | "h" | "d"]!;
  return new Date(now + ms);
}

// ─────────────────────────────────────────────────────────────────────────────
//  loginUser
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Authenticates a user by email + password.
 *
 * SECURITY CONTRACT:
 * - `passwordHash` is fetched from the DB temporarily (alongside safeUserSelect
 *   fields) so bcrypt.compare() can run. It is destructured out immediately
 *   after the check and is NEVER included in the return value.
 * - Error messages are intentionally vague ("Invalid credentials") to prevent
 *   user-enumeration attacks — callers must never reveal whether the email or
 *   the password was the problem.
 * - A refresh token is issued on every successful login, stored hashed in DB.
 *
 * @returns An object containing the signed JWT, raw refresh token, and safe user.
 * @throws  A descriptive Error (with a `.status` property) on any failure.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; refreshToken: string; user: SafeUser }> {
  // ── 1. Validate env config ────────────────────────────────────────────────
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("Server misconfiguration: JWT_SECRET is not set.");

  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshSecret) throw new Error("Server misconfiguration: REFRESH_TOKEN_SECRET is not set.");

  // ── 2. Fetch the full user record (including passwordHash) ────────────────
  const userWithHash = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { ...safeUserSelect, passwordHash: true },
  });

  // ── 3. Guard: user not found OR account deactivated ───────────────────────
  if (!userWithHash || userWithHash.status === "Deactivated") {
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // ── 4. Compare the incoming plaintext password against the stored hash ────
  const passwordMatch = await bcrypt.compare(password, userWithHash.passwordHash);
  if (!passwordMatch) {
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // ── 5. Strip passwordHash — it must never leave this function ─────────────
  const { passwordHash: _discarded, ...user } = userWithHash;

  // ── 6. Sign the access JWT ─────────────────────────────────────────────────
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"] }
  );

  // ── 7. Generate and persist refresh token (hashed) ────────────────────────
  const { raw: refreshToken, hash: tokenHash } = await generateRefreshToken();
  const expiresAt = parseExpiresIn(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d");

  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  // ── 8. Return token + refresh token + safe user ───────────────────────────
  return { token, refreshToken, user };
}

// ─────────────────────────────────────────────────────────────────────────────
//  refreshAccessToken
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Validates a raw refresh token, rotates it (delete old, create new),
 * and returns a fresh access token + new refresh token.
 *
 * Token rotation means a stolen token can only be used once before it
 * becomes invalid.
 *
 * @throws 401 error if the token is invalid, expired, or not found.
 */
export async function refreshAccessToken(
  rawToken: string
): Promise<{ token: string; refreshToken: string; user: SafeUser }> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("Server misconfiguration: JWT_SECRET is not set.");

  // ── 1. Find all non-expired tokens for fast pre-filter, then bcrypt.compare ─
  //      We can't query by hash directly (bcrypt is non-deterministic), so we
  //      fetch recent tokens for all users and compare. For scale this would
  //      need a token ID hint, but for this app size this is fine.
  const candidates = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: { select: safeUserSelect } },
    orderBy: { createdAt: "desc" },
    take: 500, // safety cap
  });

  let matched: (typeof candidates)[number] | null = null;
  for (const candidate of candidates) {
    const ok = await bcrypt.compare(rawToken, candidate.tokenHash);
    if (ok) { matched = candidate; break; }
  }

  if (!matched) {
    const err = new Error("Invalid or expired refresh token") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  if (matched.user.status === "Deactivated") {
    const err = new Error("Account deactivated") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // ── 2. Rotate: delete the old token row ──────────────────────────────────
  await prisma.refreshToken.delete({ where: { id: matched.id } });

  // ── 3. Issue a new access token ───────────────────────────────────────────
  const token = jwt.sign(
    { sub: matched.user.id, email: matched.user.email, role: matched.user.role },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"] }
  );

  // ── 4. Issue a new refresh token ──────────────────────────────────────────
  const { raw: refreshToken, hash: tokenHash } = await generateRefreshToken();
  const expiresAt = parseExpiresIn(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d");

  await prisma.refreshToken.create({
    data: { tokenHash, userId: matched.user.id, expiresAt },
  });

  return { token, refreshToken, user: matched.user };
}

// ─────────────────────────────────────────────────────────────────────────────
//  revokeRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Revokes a refresh token on logout by finding and deleting it from the DB.
 * Silently succeeds if the token is not found (already expired/rotated).
 */
export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const candidates = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  for (const candidate of candidates) {
    const ok = await bcrypt.compare(rawToken, candidate.tokenHash);
    if (ok) {
      await prisma.refreshToken.delete({ where: { id: candidate.id } });
      return;
    }
  }
  // Not found — silently OK (already rotated/expired)
}

// ─────────────────────────────────────────────────────────────────────────────
//  getCurrentUser
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves the authenticated user's profile by their ID.
 * Uses `safeUserSelect` so that `passwordHash` is never fetched from the DB.
 */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    const err = new Error("User not found.") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return user;
}
