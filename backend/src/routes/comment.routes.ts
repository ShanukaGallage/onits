import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import validate from '../middleware/validate';
import { createCommentSchema } from '../validators/comment.validator';
import {
  getCommentsByTask,
  createComment,
  deleteComment,
} from '../controllers/comment.controller';

// mergeParams allows us to access parameters from the parent router (e.g., taskId)
const router = Router({ mergeParams: true });

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: Get comments for a task
 *     description: Retrieves all comments for a specific task.
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
 *         description: Array of comment objects
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getCommentsByTask);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Create a comment on a task
 *     description: Adds a new comment to a specific task.
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
 *             $ref: '#/components/schemas/CreateCommentInput'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
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
  validate(createCommentSchema),
  createComment
);

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a specific comment from a task.
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
 *         description: The comment UUID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — User not authorized to delete this comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteComment);

export default router;
