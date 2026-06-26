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
      origin: function (origin: string | undefined, callback: (err: Error | null, origin?: boolean) => void) {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'http://localhost:4173',
          'https://nice-water-02ebe0a00.7.azurestaticapps.net'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication error: No cookies'));
      }

      // Simple cookie parser for 'token=...'
      const cookies = cookieHeader.split(';').reduce((acc, current) => {
        const [name, ...rest] = current.trim().split('=');
        acc[name] = rest.join('=');
        return acc;
      }, {} as Record<string, string>);

      const token = cookies['token'];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('Server error: Secret not configured'));
      }

      // Verify the token
      // Note: We don't use 'import jwt' up top, so let's import it here if not available, 
      // but actually we should just add the import at the top of the file.
      // Assuming jwt is imported at the top. I'll need to do a multi_replace to add the import.
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });

      if (!decoded?.sub) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user ID to socket
      socket.data.userId = decoded.sub;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Automatically join the room matching their authenticated ID
    const userId = socket.data.userId;
    if (userId) {
      socket.join(userId);
      console.log(`Socket connected & authenticated for user: ${userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected for user: ${userId}`);
    });

    // Real-Time Task Board: Join/Leave project rooms
    socket.on('project:join', (projectId: string) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log(`User ${userId} joined project room: ${projectId}`);
      }
    });

    socket.on('project:leave', (projectId: string) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`User ${userId} left project room: ${projectId}`);
      }
    });
  });

  return io;
}

/**
 * Returns the active Socket.IO instance.
 * Throws if initSocket() has not been called yet.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}
