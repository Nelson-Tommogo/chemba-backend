import { Router } from 'express';
import { 
  authenticate, 
  authorize,
  authLimiter 
} from '../middlewares/auth.js';
import { upload, handleUploadError } from '../utils/upload.js';
import {
  validateWasteReport,
  validateReportUpdate,
  validatePickupSchedule,
  validateWasteQuery
} from '../middlewares/validation.js';
import {
  createWasteReport,
  getAllWasteReports,
  getUserReports,
  getWasteReportById,
  updateWasteReport,
  deleteWasteReport,
  schedulePickup
} from '../controllers/wasteController.js';
import { catchAsync } from '../middlewares/error.js';

const router = Router();

// Apply rate limiting to all routes
router.use(authLimiter);

// Waste Reports Collection
router.post(
  '/reports',
  authenticate,
  authorize('user', 'collector'),
  upload.single('image'),
  handleUploadError,
  validateWasteReport,
  catchAsync(createWasteReport)
);

router.get(
  '/reports',
  validateWasteQuery,
  catchAsync(getAllWasteReports)
);

router.get(
  '/reports/me',
  authenticate,
  catchAsync(getUserReports)
);

router.get(
  '/reports/:id',
  catchAsync(getWasteReportById)
);

router.patch(
  '/reports/:id',
  authenticate,
  authorize('admin', 'collector'),
  validateReportUpdate,
  catchAsync(updateWasteReport)
);

router.delete(
  '/reports/:id',
  authenticate,
  authorize('admin'),
  catchAsync(deleteWasteReport)
);

// Pickup Scheduling
router.post(
  '/pickups',
  authenticate,
  authorize('user'),
  validatePickupSchedule,
  catchAsync(schedulePickup)
);

export default router;