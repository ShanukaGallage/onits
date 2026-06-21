import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Notification } from '@/types';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications').then((r) => r.data),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then((r) => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
