import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, safeUserSelect } from '../config/db';
import type { SafeUser } from '../config/db';

/**
 * Login a user with email and password.
 * 
 * Rules:
 * 1. Find user by email (fetching passwordHash only for comparison).
 * 2. If user not found, throw generic "Invalid email or password" error.
 * 3. If user status is Deactivated, throw deactivation error.
 * 4. Compare password hash.
 * 5. Sign 7-day JWT token with payload { userId, role }.
 * 6. Return safe user fetched with safeUserSelect.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: SafeUser }> {
  // Find user by email — fetch passwordHash ONLY for bcrypt comparison
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, status: true, passwordHash: true },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // If user status is Deactivated → throw Error("Your account has been deactivated")
  if (user.status === "Deactivated") {
    throw new Error("Your account has been deactivated");
  }

  // Compare password with bcrypt.compare()
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token with payload: { userId: user.id, role: user.role }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT secret is not configured");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  // Return: { token, user } where user is fetched again using safeUserSelect
  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: safeUserSelect,
  });

  if (!safeUser) {
    throw new Error("Invalid email or password");
  }

  return { token, user: safeUser };
}
