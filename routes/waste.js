// routes/waste.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js'; // ✅ named import
import {
  reportWaste,
  schedulePickup, 
  getUserReports
} from '../controllers/wasteController.js';

const router = Router();

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
