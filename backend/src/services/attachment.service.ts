import { prisma, safeUserSelect } from '../config/db';

/**
 * Return all attachments for a task with uploadedBy (select safeUserSelect)
 * If task not found: throw new Error('Task not found')
 */
export async function getAttachmentsByTask(taskId: string) {
  const taskExists = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!taskExists) {
    throw new Error('Task not found');
  }

  return prisma.attachment.findMany({
    where: { taskId },
    include: {
      uploadedBy: {
        select: safeUserSelect,
      },
    },
  });
}

/**
 * Check task exists, create attachment record, and return it with uploadedBy.
 */
export async function createAttachment(
  data: { fileName: string; fileUrl: string; fileSize: number; fileType: string; taskId: string },
  uploadedById: string
) {
  const taskExists = await prisma.task.findUnique({
    where: { id: data.taskId },
  });

  if (!taskExists) {
    throw new Error('Task not found');
  }

  return prisma.attachment.create({
    data: {
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileType: data.fileType,
      taskId: data.taskId,
      uploadedById,
    },
    include: {
      uploadedBy: {
        select: safeUserSelect,
      },
    },
  });
}

/**
 * Check attachment exists, check permission/ownership, delete attachment, and return success message.
 */
export async function deleteAttachment(id: string, requesterId: string, requesterRole: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  if (requesterRole !== 'Admin' && requesterRole !== 'ProjectManager') {
    if (attachment.uploadedById !== requesterId) {
      throw new Error('You can only delete your own attachments');
    }
  }

  await prisma.attachment.delete({
    where: { id },
  });

  return { message: 'Attachment deleted successfully' };
}
