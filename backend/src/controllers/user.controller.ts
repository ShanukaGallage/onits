import { Request, Response } from 'express';

import * as userService from '../services/user.service';
import { ZodError } from 'zod';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} from '../validators/user.validator';

/**
 * Maps error occurrences to the standard JSON API response format:
 * - 404 for User not found
 * - 400 for known client/validation errors
 * - 500 for internal errors without leaking internal system trace details
 */
const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errorCode: 400,
      message: error.issues[0]?.message || 'Validation error',
    });
  }

  const message = error instanceof Error ? error.message : '';

  if (message === 'User not found') {
    return res.status(404).json({ errorCode: 404, message });
  }

  if (message === 'Email already in use' || message === 'Current password is incorrect') {
    return res.status(400).json({ errorCode: 400, message });
  }

  return res.status(500).json({ errorCode: 500, message: 'Internal server error' });
};

/**
 * 1. getAllUsers: Returns a list of all users, filtered by search query if provided.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers(req.query.search as string);
    return res.status(200).json(users);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 2. getUserById: Returns a single user by ID.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 3. createUser: Validates input and creates a new user, returning 201.
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);
    const user = await userService.createUser(validated);
    return res.status(201).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 4. updateUser: Validates input and updates allowed user fields.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const validated = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id as string, validated);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 5. deactivateUser: Sets status of specified user to Deactivated.
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.deactivateUser(req.params.id as string);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 6. reactivateUser: Sets status of specified user back to Active.
 */
export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.reactivateUser(req.params.id as string);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 6. changePassword: Validates password input, compares current, hashes new, and updates.
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const validated = changePasswordSchema.parse(req.body);
    const user = await userService.changePassword(
      req.params.id as string,
      validated.currentPassword,
      validated.newPassword
    );
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

