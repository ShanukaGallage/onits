import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

/**
 * Initialises the Socket.IO server and attaches it to the HTTP server.
 * Call this once in server.ts after `app.listen()`.
 */
export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Each authenticated user joins a room named after their userId
    // so we can send targeted notifications via io.to(userId).emit(...)
    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

/**
 * Returns the active Socket.IO instance.
 * Throws if initSocket() has not been called yet.
 */
export { io };
