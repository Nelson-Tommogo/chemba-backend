// routes/waste.js
import { Router } from 'express';
const router = Router();
import auth from '../middlewares/auth.js';
import { reportWaste, schedulePickup, getUserReports } from '../controllers/wasteController.js';

router.post('/report', auth, reportWaste);
router.post('/schedule', auth, schedulePickup);
router.get('/my-reports', auth, getUserReports);

export default router;