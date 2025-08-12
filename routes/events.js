import { Router } from 'express';
import { 
  authenticate, 
  authorize 
} from '../middlewares/auth.js';
import { upload, handleUploadError } from '../utils/upload.js';
import {
  validateCreateWaste,
  validateWasteQuery
} from '../middlewares/validation.js';
import {
  createWasteReport,
  getAllWasteReports,
  getUserWasteReports,
  getWasteReportById,
  updateWasteReportStatus,
  deleteWasteReport
} from '../controllers/wasteController.js';
import { catchAsync } from '../middlewares/errorHandler.js';

const router = Router();
router.post(
  '/',
  authenticate,
  authorize('user', 'collector'),
  upload.single('image'),
  handleUploadError,
  validateCreateWaste,
  catchAsync(createWasteReport)
);
router.get(
  '/',
  validateWasteQuery,
  catchAsync(getAllWasteReports)
);
router.get(
  '/my-reports',
  authenticate,
  catchAsync(getUserWasteReports)
);
router.get(
  '/:id',
  catchAsync(getWasteReportById)
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'collector'),
  catchAsync(updateWasteReportStatus)
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  catchAsync(deleteWasteReport)
);

export default router;