import { Router } from 'express';
const router = Router();
import auth from '../middlewares/auth.js';
import { 
  createEvent,
  getEvents,
  getUserEvents 
} from '../controllers/eventController.js';

// POST /api/events - Create new event
router.post('/', auth, createEvent);

// GET /api/events - Get all events
router.get('/', getEvents);

// GET /api/events/my-events - Get user's events
router.get('/my-events', auth, getUserEvents);

export default router;