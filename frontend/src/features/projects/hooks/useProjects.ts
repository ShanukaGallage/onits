import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { User, Project } from '@/types';

// ─── Payload/Extended Types ──────────────────────────────────────────────────

export interface ProjectMember {
  projectId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface ProjectWithDetails extends Project {
  createdBy: User;
  members: ProjectMember[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  id: string;
  name?: string;
  description?: string;
}

export interface AddMemberPayload {
  projectId: string;
  userId: string;
}

export interface RemoveMemberPayload {
  projectId: string;
  userId: string;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

const PROJECTS_KEY = ['projects'] as const;

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all projects visible to the authenticated user.
 */
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () =>
      api.get<ProjectWithDetails[]>('/projects').then((r) => r.data),
  });
}

/**
 * Fetch a single project by ID.
 * Enabled only when projectId is not empty.
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId],
    queryFn: () =>
      api.get<ProjectWithDetails>(`/projects/${projectId}`).then((r) => r.data),
    enabled: !!projectId,
  });
}

/**
 * Create a new project.
 * Invalidates the projects list on success.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      api.post<ProjectWithDetails>('/projects', payload).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

/**
 * Update an existing project's details.
 * Invalidates the projects list and the specific project query on success.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateProjectPayload) =>
      api.put<ProjectWithDetails>(`/projects/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      void queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, variables.id] });
    },
  });
}

/**
 * Add a member to a project.
 * Invalidates the specific project query on success.
 */
export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: AddMemberPayload) =>
      api
        .post<ProjectWithDetails>(`/projects/${projectId}/members`, { userId })
        .then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...PROJECTS_KEY, variables.projectId],
      });
    },
  });
}

/**
 * Remove a member from a project.
 * Invalidates the specific project query on success.
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: RemoveMemberPayload) =>
      api
        .delete<ProjectWithDetails>(`/projects/${projectId}/members/${userId}`)
        .then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...PROJECTS_KEY, variables.projectId],
      });
    },
  });
}
