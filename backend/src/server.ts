import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import projectRouter from './routes/project.routes';
import taskRouter from './routes/task.routes';
import commentRouter from './routes/comment.routes';
import attachmentRouter from './routes/attachment.routes';
import channelRouter from './routes/channel.routes';
import messageRouter from './routes/message.routes';
import { startCronJobs } from './utils/cron';
import { verifyMailer } from './utils/mailer';
import path from 'path';

dotenv.config();

const app = express();

// Serve static uploads (e.g. avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Required to allow images to load externally
}));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/tasks/:taskId/comments', commentRouter);
app.use('/api/tasks/:taskId/attachments', attachmentRouter);
app.use('/api/channels', channelRouter);
app.use('/api/channels/:channelId/messages', messageRouter);

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OnIts API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`OnIts backend running on port ${PORT}`);
  verifyMailer();   // Confirm SMTP connection on startup
  startCronJobs();  // Start the deadline warning scheduler
});

export default app;