import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { SafeUser } from '../config/db';
import { ZodError } from 'zod';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
} from '../validators/task.validator';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

/**
 * Centrally maps service or validation errors to the standard JSON API response:
 * - 404: Task / User / Project not found
 * - 400: Validation issues, assignment logic errors
 * - 500: Internal server errors (prevents system details leakage)
 */
const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errorCode: 400,
      message: error.issues[0]?.message || 'Validation error',
    });
  }
  console.error('[TaskController] handleError:', error);

  const message = error instanceof Error ? error.message : '';

  if (
    message === 'Task not found' ||
    message === 'User not found' ||
    message === 'Project not found'
  ) {
    return res.status(404).json({ errorCode: 404, message });
  }

  const badRequests = [
    'User is already assigned to this task',
    'User is not assigned to this task',
  ];

  if (badRequests.includes(message)) {
    return res.status(400).json({ errorCode: 400, message });
  }

  return res.status(500).json({ errorCode: 500, message: 'Internal server error' });
};

/**
 * 1. getTasks: Returns tasks optionally filtered by projectId, status and/or priority.
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const { status, priority, sortBy, sortOrder } = req.query;
    const tasks = await taskService.getAllTasks(
      projectId as string, 
      {
        status: status as any,
        priority: priority as any,
      },
      {
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      }
    );
    return res.status(200).json(tasks);
  } catch (error) {
    return handleError(res, error);
  }
};

/** @deprecated use getTasks */
export const getAllTasks = getTasks;

/**
 * 2. getTaskById: Returns a single task by its unique ID.
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return res.status(200).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 3. createTask: Validates, parses, and creates a task with optional assignees.
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const { assigneeIds, dueDate, ...rest } = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(
      { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
      req.user?.id as string,
      assigneeIds
    );
    return res.status(201).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 4. updateTask: Validates and updates specific properties of an existing task.
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { dueDate, ...rest } = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(
      req.params.id,
      { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
      req.user?.id as string
    );
    return res.status(200).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 5. updateTaskStatus: Updates only the status field of a task (any authenticated user).
 */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      { status: req.body.status },
      req.user?.id as string
    );
    return res.status(200).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 6. deleteTask: Deletes a task by ID.
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 7. assignUser: Assigns a user to a task.
 */
export const assignUser = async (req: Request, res: Response) => {
  try {
    const task = await taskService.assignTask(req.params.id, req.body.userId);
    return res.status(200).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/** @deprecated use assignUser */
export const assignTask = assignUser;

/**
 * 8. unassignUser: Removes a user from a task assignment.
 */
export const unassignUser = async (req: Request, res: Response) => {
  try {
    const task = await taskService.unassignTask(req.params.id, req.params.userId);
    return res.status(200).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};

/** @deprecated use unassignUser */
export const unassignTask = unassignUser;
