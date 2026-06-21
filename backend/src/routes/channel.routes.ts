import { Router } from 'express';
import { getChannels, createChannel, deleteChannel } from '../controllers/channel.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All channel routes require authentication
router.use(authenticate);

// Get all channels (visible to everyone)
router.get('/', getChannels);

// Create and delete channels (restricted to Admin and ProjectManager)
router.post('/', authorize(['Admin', 'ProjectManager']), createChannel);
router.delete('/:id', authorize(['Admin', 'ProjectManager']), deleteChannel);

export default router;
