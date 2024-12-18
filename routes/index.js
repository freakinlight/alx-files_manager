import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// New user creation route
router.post('/users', UsersController.postNew);

export default router;
