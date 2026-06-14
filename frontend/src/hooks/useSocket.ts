import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000', {
      withCredentials: true,
      // NFR-11: Reconnection strategies with retry and exponential backoff
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return socketRef.current;
}