import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, safeUserSelect, SafeUser } from "../config/db";

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
 *
 * @returns An object containing the signed JWT string and the safe user object.
 * @throws  A descriptive Error (with a `.status` property) on any failure.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: SafeUser }> {
  // ── 1. Validate env config ────────────────────────────────────────────────
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Server misconfiguration: JWT_SECRET is not set.");
  }

  // ── 2. Fetch the full user record (including passwordHash) ────────────────
  //      This is the ONE place in the codebase that intentionally bypasses
  //      safeUserSelect — bcrypt.compare() needs the stored hash. The hash is
  //      stripped from memory before the function returns (see step 5).
  const userWithHash = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    // Spread all safe fields, then add passwordHash for this query only.
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
  //      Destructure it out so `user` contains only the safe fields.
  const { passwordHash: _discarded, ...user } = userWithHash;

  // ── 6. Sign the JWT with a payload of { id, email, role } ─────────────────
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"] }
  );

  // ── 7. Return token + safe user (no passwordHash) ─────────────────────────
  return { token, user };
}

// ─────────────────────────────────────────────────────────────────────────────
//  getCurrentUser
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves the authenticated user's profile by their ID.
 *
 * Uses `safeUserSelect` so that `passwordHash` is never fetched from the DB.
 *
 * @param userId - The UUID of the user (typically decoded from a JWT).
 * @returns The safe user object.
 * @throws  An Error if the user does not exist.
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
