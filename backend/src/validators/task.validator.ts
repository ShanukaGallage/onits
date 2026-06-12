import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required and cannot be empty'),
  description: z.string().optional(),
  dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 date-time string' }).optional(),
  priority: z.enum(['Low', 'Medium', 'High'] as const).optional(),
  projectId: z.string().uuid('projectId must be a valid UUID'),
  assigneeIds: z.array(z.string().uuid('Each assigneeId must be a valid UUID')).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO 8601 date-time string' }).optional(),
  priority: z.enum(['Low', 'Medium', 'High'] as const).optional(),
  status: z.enum(['ToDo', 'InProgress', 'Completed'] as const).optional(),
});

export const assignTaskSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
