import { z } from 'zod';

export const createAttachmentSchema = z.object({
  fileName: z.string().min(1, 'fileName is required and cannot be empty'),
  fileUrl: z.string().url('fileUrl must be a valid URL'),
  fileSize: z.number().positive('fileSize must be a positive number'),
  fileType: z.string().min(1, 'fileType is required and cannot be empty'),
  taskId: z.string().uuid('taskId must be a valid UUID'),
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
