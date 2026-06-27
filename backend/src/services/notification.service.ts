import { NotificationType } from '@prisma/client';
import { prisma } from '../config/db';
import { getIO } from '../socket/socket';
import { transporter, resolveRecipient } from '../utils/mailer';
import { User } from '@prisma/client';

/**
 * Creates a notification record in the database and emits a real-time
 * Socket.io event to the target user's room. Also sends an email notification.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string,
  user?: Partial<User>
): Promise<void> {
  const notification = await prisma.notification.create({
    data: { userId, type, message, taskId },
  });
  
  try {
    getIO().to(userId).emit('notification:new', notification);
  } catch (err) {
    console.error('Socket.io error emitting notification:', err);
  }

  // Send Email Notification if user data is provided
  if (user && user.email && user.name) {
    try {
      await sendNotificationEmail(user.email, user.name, type, message, taskId);
    } catch (err) {
      console.error(`[Mailer] Failed to send notification email to ${user.email}:`, err);
    }
  }
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function sendNotificationEmail(
  to: string,
  name: string,
  type: NotificationType,
  message: string,
  taskId?: string
) {
  // Determine subject based on type
  let subject = 'New Notification from OnIts';
  if (type === 'TaskAssigned') subject = 'You have been assigned to a new task';
  if (type === 'StatusChanged') subject = 'Task Status Update';
  if (type === 'CommentAdded') subject = 'New Comment on your task';
  if (type === 'DeadlineApproach') subject = '⚠️ Task Deadline Approaching';
  if (type === 'AdminUpdate') subject = 'Admin Update on your account';

  const recipient = resolveRecipient(to);
  const actualSubject = recipient !== to ? `[DEV → ${to}] ${subject}` : subject;

  const mailOptions = {
    from: process.env.SMTP_FROM || `"OnIts" <noreply@onits.app>`,
    to: recipient,
    subject: actualSubject,
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#0F172A;color:#E2E8F0;border-radius:12px">
  <h1 style="color:#4FACFE;font-size:20px;margin:0 0 16px">${subject}</h1>
  <p style="color:#94A3B8;margin:0 0 24px">Hi <strong>${name}</strong>,</p>
  <div style="background:#1E293B;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #4FACFE">
    <p style="margin:0;font-size:15px;color:#E2E8F0">${message}</p>
  </div>
  ${taskId ? `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Task →</a>` : `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/inbox" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open OnIts →</a>`}
  <p style="color:#334155;font-size:12px;margin-top:32px">© 2026 OnIts. This is an automated message.</p>
</div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Mailer] Notification email sent to ${to} — messageId: ${info.messageId}`);
}
