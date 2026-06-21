import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import type { Project, ProjectStatus } from '@/types';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>('/projects', fetcher);

  const updateStatus = async (projectId: string, status: ProjectStatus) => {
    // Optimistic UI update
    if (data) {
      mutate(data.map(p => p.id === projectId ? { ...p, status } : p), false);
    }
    
    try {
      await api.patch(`/projects/${projectId}/status`, { status });
      mutate(); // Re-fetch to ensure sync
    } catch (err) {
      mutate(); // Revert on failure
      throw err;
    }
  };

  return {
    projects: data,
    isLoading,
    isError: error,
    mutate,
    updateStatus
  };
}

export function useCreateProject() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    data: { name: string; description?: string },
    options?: { onSuccess?: (data: Project) => void; onError?: (err: unknown) => void }
  ) => {
    setIsPending(true);
    try {
      const res = await api.post<Project>('/projects', data);
      options?.onSuccess?.(res.data);
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useProject(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/projects/${id}` : null,
    fetcher
  );

  return {
    project: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAddMember() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    data: { projectId: string; userId: string },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    setIsPending(true);
    try {
      await api.post(`/projects/${data.projectId}/members`, { userId: data.userId });
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useRemoveMember() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    data: { projectId: string; userId: string },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    setIsPending(true);
    try {
      await api.delete(`/projects/${data.projectId}/members/${data.userId}`);
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
