import { z } from 'zod';

const dateRefinement = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return;
  const inputDate = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'dueDate cannot be in the past',
      path: ['dueDate'],
    });
  }
};

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required and cannot be empty'),
  description: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, { message: 'dueDate must be a valid date (YYYY-MM-DD or ISO 8601)' }).optional(),
  priority: z.enum(['Low', 'Medium', 'High'] as const).optional(),
  projectId: z.string().uuid('projectId must be a valid UUID'),
  assigneeIds: z.array(z.string().uuid('Each assigneeId must be a valid UUID')).optional(),
}).superRefine((data, ctx) => dateRefinement(data.dueDate, ctx));

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, { message: 'dueDate must be a valid date (YYYY-MM-DD or ISO 8601)' }).optional(),
  priority: z.enum(['Low', 'Medium', 'High'] as const).optional(),
  status: z.enum(['ToDo', 'InProgress', 'Completed'] as const).optional(),
}).superRefine((data, ctx) => dateRefinement(data.dueDate, ctx));

export const updateTaskStatusSchema = z.object({
  status: z.enum(['ToDo', 'InProgress', 'Completed'] as const),
});

export const assignTaskSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
