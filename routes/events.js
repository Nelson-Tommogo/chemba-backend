import { Router } from 'express';
const router = Router();
import auth from '../middlewares/auth.js';
import eventController from '../controllers/eventController.js';

// POST /api/events - Create new event
router.post('/', auth, eventController.createEvent);

// GET /api/events - Get all events
router.get('/', eventController.getEvents);

// GET /api/events/my-events - Get user's events
router.get('/my-events', auth, eventController.getUserEvents);

export default router;