import { prisma, safeUserSelect } from '../config/db';
import type { SafeUser } from '../config/db';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../utils/mailer';
import { Role } from '@prisma/client';

/**
 * Generates a random 12-character temporary password mixing letters and numbers.
 */
function generateTempPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

/**
 * Returns all users with select: safeUserSelect.
 * If search is provided, filters by name OR email containing search string (case-insensitive).
 */
export async function getAllUsers(search?: string): Promise<SafeUser[]> {
  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where: whereClause,
    select: safeUserSelect,
  });
}

/**
 * Returns a single user by ID with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Creates a new user with generated temporary password, hashes it, trigger welcome email,
 * and returns the created user using select: safeUserSelect.
 */
export async function createUser(data: { name: string; email: string; role: Role }): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash,
      isFirstLogin: true,
    },
    select: safeUserSelect,
  });

  // Call welcome email utility with the plain password
  await sendWelcomeEmail(user.email, user.name, tempPassword);

  return user;
}

/**
 * Updates allowed fields (name, role) of a user and returns updated user with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
export async function updateUser(id: string, data: { name?: string; role?: Role }): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
    },
    select: safeUserSelect,
  });
}

/**
 * Sets user status to Deactivated and returns updated user with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
export async function deactivateUser(id: string): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id },
    data: {
      status: 'Deactivated',
    },
    select: safeUserSelect,
  });
}

/**
 * Sets user status to Active and returns updated user with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
export async function reactivateUser(id: string): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id },
    data: {
      status: 'Active',
    },
    select: safeUserSelect,
  });
}

/**
 * Updates user passwordHash and resets isFirstLogin to false after confirming currentPassword.
 * Returns the updated user with select: safeUserSelect.
 * Throws an error if the user is not found or password validation fails.
 */
export async function changePassword(id: string, currentPassword: string, newPassword: string): Promise<SafeUser> {
  // Fetch full user record WITH passwordHash (the ONE exception)
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  return prisma.user.update({
    where: { id },
    data: {
      passwordHash: newHash,
      isFirstLogin: false,
    },
    select: safeUserSelect,
  });
}
