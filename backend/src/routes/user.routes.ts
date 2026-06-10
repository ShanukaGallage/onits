import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// GET /api/users
router.get(
  '/',
  authenticate,
  authorize(['Admin']),
  getAllUsers
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

export default router;