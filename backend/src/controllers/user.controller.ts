import { Request, Response } from 'express';
// TODO: import { userService } from '../services/user.service';
// Sajana will create this service file

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    // TODO: const users = await userService.getAllUsers({ role, status, search });
    res.status(200).json({
      message: 'getAllUsers endpoint ready — awaiting userService from Sajana',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // TODO: const user = await userService.getUserById(id);
    // if (!user) { res.status(404).json({ error: 'Not Found', message: 'User not found' }); return; }
    res.status(200).json({
      message: `getUserById endpoint ready — awaiting userService from Sajana`,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email and role are required',
      });
      return;
    }

    // TODO: const user = await userService.createUser({ name, email, role });
    res.status(201).json({
      message: 'createUser endpoint ready — awaiting userService from Sajana',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;
    // TODO: const user = await userService.updateUser(id, { name, role, status });
    res.status(200).json({
      message: 'updateUser endpoint ready — awaiting userService from Sajana',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // TODO: const user = await userService.deactivateUser(id);
    res.status(200).json({
      message: 'deactivateUser endpoint ready — awaiting userService from Sajana',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};