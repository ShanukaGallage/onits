import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import validate from '../middleware/validate';
import { createAttachmentSchema } from '../validators/attachment.validator';
import {
  getAttachmentsByTask as getAttachments,
  createAttachment,
  deleteAttachment,
} from '../controllers/attachment.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   get:
 *     summary: Get attachments for a task
 *     description: Retrieves all attachments for a specific task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Array of attachment objects
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getAttachments);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   post:
 *     summary: Create an attachment for a task
 *     description: Uploads/adds a new attachment to a specific task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttachmentInput'
 *     responses:
 *       201:
 *         description: Attachment created successfully
 *       400:
 *         description: Validation error (e.g. missing fileUrl, fileName, fileSize, fileType)
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticate,
  validate(createAttachmentSchema),
  createAttachment
);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     description: Deletes a specific attachment from a task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The attachment UUID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — User not authorized to delete this attachment
 *       404:
 *         description: Attachment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteAttachment);

export default router;
