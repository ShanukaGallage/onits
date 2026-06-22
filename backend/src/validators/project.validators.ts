import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
//  createProjectSchema
// ─────────────────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name is required' })
    .max(100, { message: 'Project name must be 100 characters or fewer' }),
  description: z.string().max(1000).optional(),
  projectKey: z.string().min(2, { message: 'Project key must be at least 2 characters' }),
  visibility: z.string().optional(),
  colorCode: z.string().optional(),
  tags: z.any().optional(),
  estimatedCompletionDate: z.string().optional(),
  externalLinks: z.any().optional(),
  coreTeamMemberIds: z.any().optional(),
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
  description: z.string().max(1000).optional(),
  projectKey: z.string().min(2).optional(),
  visibility: z.string().optional(),
  colorCode: z.string().optional(),
  tags: z.any().optional(),
  estimatedCompletionDate: z.string().optional(),
  externalLinks: z.any().optional(),
  status: z
    .enum(['Planning', 'InProgress', 'Completed', 'Archived'] as const, {
      message: 'Status must be Planning, InProgress, Completed, or Archived',
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
