import { NotificationType } from '@prisma/client';
import { prisma } from '../config/db';
import { getIO } from '../socket/socket';

/**
 * Creates a notification record in the database and emits a real-time
 * Socket.io event to the target user's room.
 *
 * @param userId  - The recipient user's ID.
 * @param type    - The NotificationType enum value (e.g. 'TaskAssigned', 'DeadlineApproach').
 * @param message - Human-readable notification message.
 * @param taskId  - Optional task ID to link the notification to a specific task.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string
): Promise<void> {
  const notification = await prisma.notification.create({
    data: { userId, type, message, taskId },
  });
  getIO().to(userId).emit('notification:new', notification);
}
