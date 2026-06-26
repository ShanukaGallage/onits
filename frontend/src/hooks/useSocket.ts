import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

let globalSocket: Socket | null = null;

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    // If no user, disconnect and clear global socket
    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setSocket(null);
      }
      return;
    }

    // If user exists and socket doesn't, create it
    if (!globalSocket) {
      const socketUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '') 
        : 'http://localhost:5000';

      globalSocket = io(socketUrl, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
      });
    }

    // Always ensure this component's state matches the global socket
    setSocket(globalSocket);
  }, [user]);

  return socket;
}