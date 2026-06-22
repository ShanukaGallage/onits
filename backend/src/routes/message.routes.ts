import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

// All message routes require authentication
router.use(authenticate);

// Get messages for a channel
router.get('/', getMessages);

// Send a message to a channel
router.post('/', createMessage);

export default router;
