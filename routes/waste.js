import { Router } from 'express';
import { 
  authenticate, 
  authorize 
} from '../middlewares/auth.js';
import { upload, handleUploadError } from '../utils/upload.js';
import {
  validateWasteReport,
  validatePickupSchedule
} from '../middlewares/validation.js';
import {
  reportWaste,
  schedulePickup,
  getUserReports,
  getReportDetails,
  updateReportStatus
} from '../controllers/wasteController.js';
import { catchAsync } from '../middlewares/errorHandler.js';

const router = Router();

// Report waste
router.post(
  '/report',
  authenticate,
  authorize(['user', 'collector']),
  upload.single('image'),
  handleUploadError,
  validateWasteReport,
  catchAsync(reportWaste)
);

// Schedule pickup
router.post(
  '/schedule',
  authenticate,
  authorize(['user']),
  validatePickupSchedule,
  catchAsync(schedulePickup)
);

// Get user's reports
router.get(
  '/my-reports',
  authenticate,
  catchAsync(getUserReports)
);

// Get report details
router.get(
  '/reports/:id',
  authenticate,
  catchAsync(getReportDetails)
);

// Update report status
router.patch(
  '/reports/:id/status',
  authenticate,
  authorize(['collector', 'admin']),
  catchAsync(updateReportStatus)
);

export default router;