import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import { ZodError } from 'zod';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validators/project.validator';

import { SafeUser } from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

/**
 * Centrally maps service or validation errors to the standard JSON API response:
 * - 404 for Project / User not found
 * - 400 for bad request logic (already a member, validation issues, etc.)
 * - 500 for unhandled/internal errors to avoid leaking database or code trace details
 */
const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errorCode: 400,
      message: error.issues[0]?.message || 'Validation error',
    });
  }

  const message = error instanceof Error ? error.message : '';

  if (message === 'Project not found' || message === 'User not found') {
    return res.status(404).json({ errorCode: 404, message });
  }

  const badRequests = [
    'User is already a member of this project',
    'User is not a member of this project',
  ];

  if (badRequests.includes(message)) {
    return res.status(400).json({ errorCode: 400, message });
  }

  return res.status(500).json({ errorCode: 500, message: 'Internal server error' });
};

/**
 * 1. getAllProjects: Returns a list of all projects including members and creators.
 */
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    return res.status(200).json(projects);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 2. getProjectById: Returns a single project by ID with members and creator.
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.id as string);
    return res.status(200).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 3. createProject: Validates input and creates a project with the authenticated creator added.
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const createdById = req.user?.id as string;
    const project = await projectService.createProject(validated, createdById);
    return res.status(201).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 4. updateProject: Validates input and updates name/description of a project.
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const validated = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id as string, validated);
    return res.status(200).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 5. deleteProject: Wipes a project from the DB (cascade rules delete tasks/members).
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const result = await projectService.deleteProject(req.params.id as string);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 6. addMember: Validates user ID, checks constraints, and appends a ProjectMember.
 */
export const addMember = async (req: Request, res: Response) => {
  try {
    const { userId } = addMemberSchema.parse(req.body);
    const project = await projectService.addMember(req.params.id as string, userId);
    return res.status(200).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 7. removeMember: Validates membership presence and deletes the ProjectMember connection.
 */
export const removeMember = async (req: Request, res: Response) => {
  try {
    const project = await projectService.removeMember(
      req.params.id as string,
      req.params.userId as string
    );
    return res.status(200).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * 8. updateProjectStatus: Validates input and updates status of a project.
 */
export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Planning', 'InProgress', 'Completed', 'Archived'].includes(status)) {
      return res.status(400).json({ errorCode: 400, message: 'Invalid status' });
    }
    const project = await projectService.updateProjectStatus(req.params.id as string, status);
    return res.status(200).json(project);
  } catch (error) {
    return handleError(res, error);
  }
};
