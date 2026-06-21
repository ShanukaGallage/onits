import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  uploadAvatar,
  removeAvatar,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload';

const router = Router();

// GET /api/users
router.get(
  '/',
  authenticate,
  authorize(['Admin']),
  getAllUsers
);

// POST /api/users/me/avatar
router.post(
  '/me/avatar',
  authenticate,
  uploadMiddleware.single('avatar'),
  uploadAvatar
);

// DELETE /api/users/me/avatar
router.delete(
  '/me/avatar',
  authenticate,
  removeAvatar
);

// POST /api/users
router.post(
  '/',
  authenticate,
  authorize(['Admin']),
  createUser
);

// GET /api/users/:id
router.get(
  '/:id',
  authenticate,
  authorize(['Admin']),
  getUserById
);

// PUT /api/users/:id
router.put(
  '/:id',
  authenticate,
  authorize(['Admin']),
  updateUser
);

// PATCH /api/users/:id/deactivate
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize(['Admin']),
  deactivateUser
);

// PATCH /api/users/:id/reactivate
router.patch(
  '/:id/reactivate',
  authenticate,
  authorize(['Admin']),
  reactivateUser
);

export default router;