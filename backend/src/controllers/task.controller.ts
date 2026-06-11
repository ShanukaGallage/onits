import { Request, Response } from 'express';
import {
  getTasksForProjectManager,
  getTasksForCollaborator,
  createTask as createTaskService,
  getTaskById as getTaskByIdService,
  updateTask as updateTaskService,
  updateTaskStatus as updateTaskStatusService,
  deleteTask as deleteTaskService,
  assignUser as assignUserService,
  unassignUser as unassignUserService,
} from '../services/task.service';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.projectId as string;
    const role = req.user?.role;
    const userId = req.user?.id as string;

    let tasks;
    if (role === 'ProjectManager' || role === 'Admin') {
      tasks = await getTasksForProjectManager(projectId);
    } else {
      tasks = await getTasksForCollaborator(projectId, userId);
    }
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await createTaskService(req.body, req.user?.id as string);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await getTaskByIdService(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await updateTaskService(req.params.id, req.body);
    if (!task) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await updateTaskStatusService(req.params.id, req.body.status);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteTaskService(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const assignUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await assignUserService(req.params.id, req.body.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const unassignUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await unassignUserService(req.params.id, req.params.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};