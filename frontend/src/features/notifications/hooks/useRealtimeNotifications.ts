import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import type { Notification } from '@/types';

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      // Show toast
      toast.info(notification.message, {
        description: notification.type,
      });

      // Update cache directly for instant UI update
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!old) return [notification];
        if (old.some(n => n.id === notification.id)) return old;
        return [notification, ...old];
      });
      
      // Also invalidate to ensure it stays in sync
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [queryClient, socket]);
}
