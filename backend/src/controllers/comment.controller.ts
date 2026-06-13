import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { SafeUser } from '../config/db';
import { ZodError } from 'zod';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errorCode: 400,
      message: error.issues[0]?.message || 'Validation error',
    });
  }

  const message = error instanceof Error ? error.message : '';

  if (message === 'Comment not found' || message === 'Task not found') {
    return res.status(404).json({ errorCode: 404, message });
  }

  const forbiddenRequests = [
    'You can only edit your own comments',
    'You can only delete your own comments',
  ];

  if (forbiddenRequests.includes(message)) {
    return res.status(403).json({ errorCode: 403, message });
  }

  return res.status(500).json({ errorCode: 500, message: 'Internal server error' });
};

export const getCommentsByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const comments = await commentService.getCommentsByTask(taskId);
    return res.status(200).json(comments);
  } catch (error) {
    return handleError(res, error);
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const validated = createCommentSchema.parse(req.body);
    const createdById = req.user?.id as string;
    const comment = await commentService.createComment(validated, createdById);
    return res.status(201).json(comment);
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = updateCommentSchema.parse(req.body);
    const requesterId = req.user?.id as string;
    const comment = await commentService.updateComment(id, content, requesterId);
    return res.status(200).json(comment);
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id as string;
    const requesterRole = req.user?.role as string;
    const result = await commentService.deleteComment(id, requesterId, requesterRole);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};
