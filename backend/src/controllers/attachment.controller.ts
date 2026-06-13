import { Request, Response } from 'express';
import * as attachmentService from '../services/attachment.service';
import { SafeUser } from '../config/db';
import { ZodError } from 'zod';
import { createAttachmentSchema } from '../validators/attachment.validator';

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

  if (message === 'Attachment not found' || message === 'Task not found') {
    return res.status(404).json({ errorCode: 404, message });
  }

  const forbiddenRequests = [
    'You can only delete your own attachments',
  ];

  if (forbiddenRequests.includes(message)) {
    return res.status(403).json({ errorCode: 403, message });
  }

  return res.status(500).json({ errorCode: 500, message: 'Internal server error' });
};

export const getAttachmentsByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const attachments = await attachmentService.getAttachmentsByTask(taskId);
    return res.status(200).json(attachments);
  } catch (error) {
    return handleError(res, error);
  }
};

export const createAttachment = async (req: Request, res: Response) => {
  try {
    const validated = createAttachmentSchema.parse(req.body);
    const uploadedById = req.user?.id as string;
    const attachment = await attachmentService.createAttachment(validated, uploadedById);
    return res.status(201).json(attachment);
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id as string;
    const requesterRole = req.user?.role as string;
    const result = await attachmentService.deleteAttachment(id, requesterId, requesterRole);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};
