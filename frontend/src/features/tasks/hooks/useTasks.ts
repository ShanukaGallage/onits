import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Task, Priority, TaskStatus, User } from '@/types';

// ─── Payload/Extended Types ──────────────────────────────────────────────────

export interface TaskAssignment {
  taskId: string;
  userId: string;
  assignedAt: string;
  user: User;
}

export interface TaskWithDetails extends Task {
  createdBy: User;
  assignments: TaskAssignment[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  projectId: string;
  assigneeIds?: string[];
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  status?: TaskStatus;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all tasks for a project, with optional status/priority filters.
 * Enabled only when projectId is not empty.
 */
export function useTasks(
  projectId: string,
  filters?: {
    status?: string;
    priority?: string;
  }
) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () =>
      api
        .get<TaskWithDetails[]>(
          `/tasks/project/${projectId}`,
          {
            params: {
              status: filters?.status,
              priority: filters?.priority,
            },
          }
        )
        .then((r) => r.data),
    enabled: !!projectId,
  });
}

/**
 * Fetch a single task by ID.
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () =>
      api.get<TaskWithDetails>(`/tasks/${taskId}`).then((r) => r.data),
    enabled: !!taskId,
  });
}

/**
 * Create a new task.
 * Invalidates the tasks query key on success.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      api.post<TaskWithDetails>('/tasks', payload).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Update only the status of a task with optimistic caching and rollback.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: 
    
    {taskId: string;
     status: TaskStatus;
}) =>
      api.patch<TaskWithDetails>(
  `/tasks/${taskId}/status`, { status }).then((r) => r.data),
    onMutate: async ({
  taskId,
  status,
}) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueriesData<TaskWithDetails[]>({ queryKey: ['tasks'] });

      // Optimistically update
      queryClient.setQueriesData<TaskWithDetails[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === taskId ? { ...task, status } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, value]) => {
          queryClient.setQueryData(queryKey, value);
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Update an existing task.
 * Invalidates the tasks query and the specific task detail query.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateTaskPayload) =>
      api.put<TaskWithDetails>(`/tasks/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', variables.id] });
    },
  });
}

/**
 * Delete a task by ID.
 * Invalidates the tasks query.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/tasks/${id}`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Assign a user to a task.
 * Invalidates the specific task detail query.
 */
export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string | null }) =>
      api.post<TaskWithDetails>(`/tasks/${taskId}/assign`, { userId }).then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', variables.taskId] });
      // Invalidate the main tasks list query to sync lists with assignee changes
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
