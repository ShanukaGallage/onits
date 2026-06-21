import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Message {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string;
  };
}

export function useMessages(channelId: string) {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: () => api.get<Message[]>(`/channels/${channelId}/messages`).then((r) => r.data),
    enabled: !!channelId && channelId !== 'system',
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      api.post<Message>(`/channels/${channelId}/messages`, { content }).then((r) => r.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', variables.channelId] });
    },
  });
}
