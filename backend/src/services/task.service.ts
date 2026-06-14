import { prisma, safeUserSelect } from '../config/db';
import { Priority, TaskStatus, NotificationType } from '@prisma/client';
// @ts-ignore
import { io } from '../socket/socket';

/**
 * Helper function to create a notification record and emit a Socket.io event.
 */
async function createNotification(userId: string, type: NotificationType, message: string, taskId?: string) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, taskId }
  });
  io.to(userId).emit('notification:new', notification);
}

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
  data: { title: string; description?: string; dueDate?: Date; priority?: Priority; projectId: string },
  createdById: string,
  assigneeIds?: string[]
) {
  const task = await prisma.$transaction(async (tx) => {
    // 1. Create the task
    const newTask = await tx.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        projectId: data.projectId,
        createdById,
      },
    });

    // 2. If assignees provided, create assignments and notifications
    if (assigneeIds && assigneeIds.length > 0) {
      // Create TaskAssignment records
      await tx.taskAssignment.createMany({
        data: assigneeIds.map((userId) => ({
          taskId: newTask.id,
          userId,
        })),
      });

      // Send a notification to each assignee
      for (const assigneeId of assigneeIds) {
        const notification = await tx.notification.create({
          data: {
            userId: assigneeId,
            type: 'TaskAssigned',
            message: `You have been assigned to task: ${data.title}`,
            taskId: newTask.id,
          },
        });
        io.to(assigneeId).emit('notification:new', notification);
      }
    }

    return newTask;
  });

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
  data: { title?: string; description?: string; dueDate?: Date; priority?: Priority; status?: TaskStatus },
  updatedById: string
) {
  const existing = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: true,
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
        id
      );
    }
  }

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

  await createNotification(
    userId,
    'TaskAssigned',
    `You have been assigned to task: ${task.title}`,
    taskId
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

  return updated;
}
