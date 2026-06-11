import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignUser,
  unassignUser,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import validate from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignUserSchema,
} from '../validators/task.validators';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks
 *     description: ProjectManagers and Admins see all tasks in the project. Collaborators see only their assigned tasks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by project ID
 *     responses:
 *       200:
 *         description: Array of task objects
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a task. Restricted to ProjectManagers and Admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — insufficient role
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(createTaskSchema),
  createTask
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Retrieves a single task with its comments and assignments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task object
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Updates a task. Restricted to ProjectManagers and Admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/UpdateTaskInput'
 *     responses:
 *       200:
 *         description: Updated task object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(updateTaskSchema),
  updateTask
);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     description: Updates only the status of a task. All authenticated roles can do this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/UpdateTaskStatusInput'
 *     responses:
 *       200:
 *         description: Task status updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:id/status',
  authenticate,
  validate(updateTaskStatusSchema),
  updateTaskStatus
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Permanently deletes a task. Restricted to ProjectManagers and Admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  deleteTask
);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Assign a user to a task
 *     description: Assigns a user to a task. Restricted to ProjectManagers and Admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/AssignUserInput'
 *     responses:
 *       200:
 *         description: User assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Task or user not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/assign',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(assignUserSchema),
  assignUser
);

/**
 * @swagger
 * /api/tasks/{id}/assign/{userId}:
 *   delete:
 *     summary: Unassign a user from a task
 *     description: Removes a user assignment from a task. Restricted to ProjectManagers and Admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user UUID to unassign
 *     responses:
 *       200:
 *         description: User unassigned successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Task or assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id/assign/:userId',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  unassignUser
);

export default router;