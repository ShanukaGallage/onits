import { Router } from 'express';
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateProjectStatus,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import validate from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validators/project.validators';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProjectInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, maxLength: 100 }
 *         description: { type: string, maxLength: 1000 }
 *     UpdateProjectInput:
 *       type: object
 *       properties:
 *         name: { type: string, maxLength: 100 }
 *         description: { type: string, maxLength: 1000 }
 *     AddMemberInput:
 *       type: object
 *       required: [userId]
 *       properties:
 *         userId: { type: string, format: uuid }
 */
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     description: Returns every project visible to the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of project objects
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticate,
  getAllProjects
);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a project. Restricted to ProjectManagers and Admins.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectInput'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error — missing or invalid fields
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient role
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(createProjectSchema),
  createProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Retrieves a single project by its UUID. Any authenticated user may call this.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project's UUID
 *     responses:
 *       200:
 *         description: Project object
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authenticate,
  getProjectById
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     description: Updates an existing project's details. Restricted to ProjectManagers and Admins.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project's UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectInput'
 *     responses:
 *       200:
 *         description: Updated project object
 *       400:
 *         description: Validation error — invalid field values
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(updateProjectSchema),
  updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Permanently deletes a project. Restricted to Admins only.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project's UUID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['Admin']),
  deleteProject
);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add a member to a project
 *     description: Assigns a user to a project. Restricted to ProjectManagers and Admins.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project's UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMemberInput'
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: Validation error — missing or invalid fields
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Project or user not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/members',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  validate(addMemberSchema),
  addMember
);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a project
 *     description: Unassigns a user from a project. Restricted to ProjectManagers and Admins.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project's UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthenticated — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient role
 *       404:
 *         description: Project or membership not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id/members/:userId',
  authenticate,
  authorize(['ProjectManager', 'Admin']),
  removeMember
);

export default router;
