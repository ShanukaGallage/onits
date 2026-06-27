import { Router } from 'express';
import {
  getAllTasks,
  getMyTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignTask,
  unassignTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import validate from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
} from '../validators/task.validator';

const router = Router();

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Get tasks for a project
 *     description: ProjectManagers and Admins see all tasks in the project. Collaborators see only their assigned tasks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tasks by priority
 *     responses:
 *       200:
 *         description: Array of task objects
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', authenticate, getAllTasks);

/**
 * @swagger
 * /api/tasks/me:
 *   get:
 *     summary: Get tasks assigned to the current user
 *     description: Retrieves all tasks assigned to the current user across all projects.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of task objects
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal server error
 */
router.get('/me', authenticate, getMyTasks);


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
 *     description: Updates only the status field of a task. Available to any authenticated user (including Collaborators) as long as they are assigned to the task or are an Admin/ProjectManager.
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ToDo, InProgress, Completed]
 *     responses:
 *       200:
 *         description: Updated task object
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
 *             $ref: '#/components/schemas/AssignTaskInput'
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
  validate(assignTaskSchema),
  assignTask
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
  unassignTask
);

export default router;