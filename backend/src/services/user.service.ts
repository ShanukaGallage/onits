import { prisma, safeUserSelect } from '../config/db';
import type { SafeUser } from '../config/db';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendPasswordChangedEmail } from '../utils/mailer';
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
export async function createUser(data: { name: string; username: string; email: string; role: Role }): Promise<SafeUser> {
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
      username: data.username,
      email: data.email,
      role: data.role,
      passwordHash,
      isFirstLogin: true,
    },
    select: safeUserSelect,
  });

  // Send welcome email — wrapped in its own try/catch so a mail failure
  // never rolls back the already-persisted user record.
  try {
    await sendWelcomeEmail(data.email, data.name, data.username, tempPassword);
  } catch (emailError) {
    console.error('Welcome email failed to send:', emailError);
    // User is already created — do not throw, just log
  }

  return user;
}

/**
 * Updates allowed fields (name, role) of a user and returns updated user with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
// username is intentionally excluded — it is permanent and cannot be updated
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
 * Updates a user's avatar URL and returns updated user with select: safeUserSelect.
 * Throws an error if the user is not found.
 */
export async function updateAvatar(id: string, avatarUrl: string): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id },
    data: {
      avatarUrl,
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

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      passwordHash: newHash,
      isFirstLogin: false,
    },
    select: safeUserSelect,
  });

  // Notify user their password was changed — isolated so a mail failure never
  // prevents the password update from being returned to the caller.
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Password changed email failed to send:', emailError);
  }

  return updatedUser;
}

/**
 * Finds a user by username and adds them as a member of the given project.
 * Throws if the user does not exist or is already a member.
 */
export async function addProjectMemberByUsername(projectId: string, username: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: safeUserSelect,
  });
  if (!user) throw new Error('User not found');

  const existing = await prisma.projectMember.findFirst({
    where: { projectId, userId: user.id },
  });
  if (existing) throw new Error('User is already a member of this project');

  await prisma.projectMember.create({
    data: { projectId, userId: user.id },
  });
  return user;
}
