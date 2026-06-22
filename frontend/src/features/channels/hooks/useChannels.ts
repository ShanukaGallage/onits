import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Channel {
  id: string;
  name: string;
  type: 'Project' | 'Thread';
  projectId?: string;
  createdById: string;
  createdAt: string;
  _count?: {
    messages: number;
  };
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: () => api.get<Channel[]>('/channels').then((r) => r.data),
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; type: 'Project' | 'Thread'; projectId?: string }) =>
      api.post<Channel>('/channels', payload).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/channels/${id}`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}
