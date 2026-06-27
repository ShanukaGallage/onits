import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { User, Role } from '@/types';

// ─── Payload Types ──────────────────────────────────────────────────────────

export interface CreateUserPayload {
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  role?: Role;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

const USERS_KEY = ['users'] as const;

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all users, with an optional server-side search filter.
 */
export function useUsers(search?: string) {
  return useQuery({
    queryKey: search ? [...USERS_KEY, { search }] : USERS_KEY,
    queryFn: () =>
      api
        .get<User[]>('/users', { params: search ? { search } : undefined })
        .then((r) => r.data),
  });
}

/**
 * Create a new user (Admin only).
 * Invalidates the users list on success.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      api.post<User>('/users', payload).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

/**
 * Update an existing user's name, email, or role.
 * Invalidates the users list on success.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserPayload) =>
      api.put<User>(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

/**
 * Deactivate a user by ID (sets status to 'Deactivated').
 * Invalidates the users list on success.
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.patch<User>(`/users/${id}/deactivate`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

/**
 * Reactivate a user by ID (sets status back to 'Active').
 * Invalidates the users list on success.
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.patch<User>(`/users/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

/**
 * Delete a user by ID.
 * Invalidates the users list on success.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
