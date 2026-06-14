import { Router } from "express";
import validate from "../middleware/validate";
import { loginSchema } from "../validators/auth.validator";
import { loginController, logoutController, meController, refreshController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *   schemas:
 *     SafeUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "9f3c0b1e-7c9a-4d3c-9a1f-6a4d6e2b1c33"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         role:
 *           type: string
 *           example: "Collaborator"
 *         status:
 *           type: string
 *           example: "Active"
 *         isFirstLogin:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful, sets HTTP-only session cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SafeUser'
 *       400:
 *         description: Validation failed or invalid request payload
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", validate(loginSchema), loginController);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out current user and clear token cookie
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized - no valid session cookie found
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authenticate, logoutController);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the access token using the refresh token cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token issued, returns logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SafeUser'
 *       401:
 *         description: Invalid or expired refresh token — user must log in again
 */
router.post("/refresh", refreshController);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns the logged in user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SafeUser'
 *       401:
 *         description: Unauthorized - no valid session cookie found
 *       500:
 *         description: Internal server error
 */
router.get("/me", authenticate, meController);

export default router;
