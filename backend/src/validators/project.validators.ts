import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
//  createProjectSchema
// ─────────────────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name is required' })
    .max(100, { message: 'Project name must be 100 characters or fewer' }),

  description: z
    .string()
    .max(1000, { message: 'Description must be 1000 characters or fewer' })
    .optional(),

  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO 8601 date-time string' })
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  updateProjectSchema
// ─────────────────────────────────────────────────────────────────────────────
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name cannot be empty' })
    .max(100, { message: 'Project name must be 100 characters or fewer' })
    .optional(),

  description: z
    .string()
    .max(1000, { message: 'Description must be 1000 characters or fewer' })
    .optional(),

  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO 8601 date-time string' })
    .optional(),

  status: z
    .enum(['Active', 'Completed', 'Archived'] as const, {
      message: 'Status must be Active, Completed, or Archived',
    })
    .optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  addMemberSchema
// ─────────────────────────────────────────────────────────────────────────────
export const addMemberSchema = z.object({
  userId: z
    .string()
    .uuid({ message: 'userId must be a valid UUID' }),

  role: z
    .enum(['ProjectManager', 'Collaborator'] as const, {
      message: 'Role must be ProjectManager or Collaborator',
    })
    .optional(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
