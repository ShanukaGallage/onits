import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required and cannot be empty'),
  taskId: z.string().uuid('taskId must be a valid UUID'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
