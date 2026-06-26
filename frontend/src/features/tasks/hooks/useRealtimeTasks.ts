import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { mutate as swrMutate } from 'swr';

export function useRealtimeTasks(projectId?: string) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Join the project room to receive real-time updates for tasks in this project
    if (projectId) {
      socket.emit('project:join', projectId);
    }

    const handleTaskCreated = (newTask: any) => {
      // Optimistically add to cache for immediate UI update
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        // avoid duplicates
        if (old.some(t => t.id === newTask.id)) return old;
        return [newTask, ...old];
      });
      // Still invalidate to ensure full consistency
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) void swrMutate(`/projects/${projectId}`);
    };

    const handleTaskUpdated = (updatedTask: any) => {
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(t => t.id === updatedTask.id ? updatedTask : t);
      });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) void swrMutate(`/projects/${projectId}`);
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter(t => t.id !== id);
      });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) void swrMutate(`/projects/${projectId}`);
    };

    const invalidateTasks = () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) void swrMutate(`/projects/${projectId}`);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('notification:new', invalidateTasks);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('notification:new', invalidateTasks);
      if (projectId) {
        socket.emit('project:leave', projectId);
      }
    };
  }, [socket, projectId, queryClient]);
}
