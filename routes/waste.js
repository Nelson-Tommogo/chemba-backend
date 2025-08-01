import { Router } from 'express';
const router = Router();
import { auth } from '../middlewares/auth.js';
import {
  reportWaste,
  schedulePickup, 
  getUserReports
} from '../controllers/wasteController.js';

// Waste reporting endpoint
router.post('/report', 
  auth,
  reportWaste
);

// Waste collection scheduling endpoint  
router.post('/schedule',
  auth,
  schedulePickup
);

// User's waste reports history
router.get('/my-reports',
  auth,
  getUserReports
);

export default router;