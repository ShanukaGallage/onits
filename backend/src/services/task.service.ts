import { prisma, safeUserSelect } from '../config/db';
import { Priority, TaskStatus, NotificationType } from '@prisma/client';
import { getIO } from '../socket/socket';
import { sendTaskAssignedEmail } from '../utils/mailer';

import { createNotification } from './notification.service';

/**
 * Returns all tasks for a project, optionally filtered by status and priority, and optionally sorted.
 */
export async function getAllTasks(
  projectId: string,
  filters?: { status?: TaskStatus; priority?: Priority },
  sort?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
) {
  const where: any = {};
  if (projectId) {
    where.projectId = projectId;
  }
  
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.priority) {
    where.priority = filters.priority;
  }

  // Allowed fields for sorting to prevent injection
  const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'status', 'title'];
  const orderBy: any = {};
  
  if (sort?.sortBy && allowedSortFields.includes(sort.sortBy)) {
    orderBy[sort.sortBy] = sort.sortOrder === 'desc' ? 'desc' : 'asc';
  } else {
    // Default sort
    orderBy['createdAt'] = 'desc';
  }

  return prisma.task.findMany({
    where,
    orderBy,
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });
}

/**
 * Returns a single task by ID with createdBy, assignments, comments, and attachments.
 * Throws an error if not found.
 */
export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
      comments: true,
      attachments: true,
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

/**
 * Creates a task, optionally creates assignments, and notifies assignees.
 */
export async function createTask(
  data: { title: string; description?: string; dueDate?: Date; priority?: Priority; projectId: string; tags?: string[]; initialComment?: string },
  createdById: string,
  assigneeIds?: string[]
) {
  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      projectId: data.projectId,
      createdById,
      tags: data.tags || [],
      comments: data.initialComment ? {
        create: {
          content: data.initialComment,
          createdById,
        }
      } : undefined,
      assignments: assigneeIds && assigneeIds.length > 0 ? {
        create: assigneeIds.map((userId) => ({
          userId,
        }))
      } : undefined,
    },
  });

  // If assignees provided, create notifications and send emails AFTER task is created
  if (assigneeIds && assigneeIds.length > 0) {
    for (const assigneeId of assigneeIds) {
      const notification = await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'TaskAssigned',
          message: `You have been assigned to task: ${data.title}`,
          taskId: newTask.id,
        },
      });
      getIO().to(assigneeId).emit('notification:new', notification);

      // Fetch user to send email
      const user = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (user) {
        sendTaskAssignedEmail(user.email, user.name, data.title).catch(console.error);
      }
    }
  }

  const task = newTask;

  // Broadcast real-time update to project room
  getIO().to(`project:${task.projectId}`).emit('task:created', task);

  // Return the full task with createdBy and assignments (using safeUserSelect)
  const result = await prisma.task.findUnique({
    where: { id: task.id },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });

  if (!result) {
    throw new Error('Failed to retrieve created task');
  }

  return result;
}

/**
 * Updates a task. If status changes, notifies all assignees.
 * Throws an error if not found.
 */
export async function updateTask(
  id: string,
  data: { title?: string; description?: string; dueDate?: Date; priority?: Priority; status?: TaskStatus; tags?: string[] },
  updatedById: string
) {
  const existing = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { user: true }
      },
    },
  });

  if (!existing) {
    throw new Error('Task not found');
  }

  const statusChanged = data.status && data.status !== existing.status;

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      tags: data.tags,
    },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });

  // If status changed, notify all assignees
  if (statusChanged && data.status) {
    for (const assignment of existing.assignments) {
      await createNotification(
        assignment.userId,
        'StatusChanged',
        `Task "${updatedTask.title}" status changed to ${data.status}`,
        id,
        assignment.user
      );
    }
  }

  // Broadcast real-time update to project room
  getIO().to(`project:${updatedTask.projectId}`).emit('task:updated', updatedTask);

  return updatedTask;
}

/**
 * Deletes a task by ID.
 * Throws an error if not found.
 */
export async function deleteTask(id: string) {
  const existing = await prisma.task.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Task not found');
  }

  await prisma.task.delete({
    where: { id },
  });

  // Broadcast real-time update to project room
  getIO().to(`project:${existing.projectId}`).emit('task:deleted', { id });

  return { message: 'Task deleted successfully' };
}

/**
 * Assigns a user to a task.
 * Throws if task not found or user already assigned.
 */
export async function assignTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  const existingAssignment = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error('User is already assigned to this task');
  }

  await prisma.taskAssignment.create({
    data: {
      taskId,
      userId,
    },
  });

  const userToAssign = await prisma.user.findUnique({ where: { id: userId } });
  await createNotification(
    userId,
    'TaskAssigned',
    `You have been assigned to task: ${task.title}`,
    taskId,
    userToAssign || undefined
  );

  const updated = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });

  if (!updated) {
    throw new Error('Task not found after assignment');
  }

  // Broadcast real-time update to project room
  getIO().to(`project:${updated.projectId}`).emit('task:updated', updated);

  return updated;
}

/**
 * Unassigns a user from a task.
 * Throws if task not found or assignment does not exist.
 */
export async function unassignTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  const existingAssignment = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });

  if (!existingAssignment) {
    throw new Error('User is not assigned to this task');
  }

  await prisma.taskAssignment.delete({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });

  const updated = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      assignments: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });

  if (!updated) {
    throw new Error('Task not found after unassignment');
  }

  // Broadcast real-time update to project room
  getIO().to(`project:${updated.projectId}`).emit('task:updated', updated);

  return updated;
}
