import { prisma, safeUserSelect } from '../config/db';
import { NotificationType } from '@prisma/client';
import { getIO } from '../socket/socket';

/**
 * Helper function to create a notification record and emit a Socket.io event.
 */
async function createNotification(userId: string, type: NotificationType, message: string, taskId?: string) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, taskId }
  });
  getIO().to(userId).emit('notification:new', notification);
}

/**
 * Return all comments for a task with createdBy (select safeUserSelect)
 * If task not found: throw new Error('Task not found')
 */
export async function getCommentsByTask(taskId: string) {
  const taskExists = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!taskExists) {
    throw new Error('Task not found');
  }

  return prisma.comment.findMany({
    where: { taskId },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
    },
  });
}

/**
 * Create comment, notify task assignees (excluding the creator), and return the comment.
 */
export async function createComment(
  data: { content: string; taskId: string },
  createdById: string
) {
  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    select: {
      title: true,
      assignments: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      taskId: data.taskId,
      createdById,
    },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
    },
  });

  // Get all task assignees and notify them (except comment creator)
  const assigneeIds = task.assignments.map((assignment) => assignment.userId);
  for (const assigneeId of assigneeIds) {
    if (assigneeId !== createdById) {
      await createNotification(
        assigneeId,
        'CommentAdded',
        `New comment on task: "${task.title}"`,
        data.taskId
      );
    }
  }

  return comment;
}

/**
 * Update content of a comment after verifying ownership.
 */
export async function updateComment(id: string, content: string, requesterId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.createdById !== requesterId) {
    throw new Error('You can only edit your own comments');
  }

  return prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
    },
  });
}

/**
 * Delete a comment after verifying ownership or admin/manager status.
 */
export async function deleteComment(id: string, requesterId: string, requesterRole: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (requesterRole !== 'Admin' && requesterRole !== 'ProjectManager') {
    if (comment.createdById !== requesterId) {
      throw new Error('You can only delete your own comments');
    }
  }

  await prisma.comment.delete({
    where: { id },
  });

  return { message: 'Comment deleted successfully' };
}
