import { Router } from 'express';
import {
  authenticate,
  authorize,
  checkTokenFreshness
} from '../middlewares/auth.js';
import {
  getCurrentUser,
  getUsersByRole,
  updateUserProfile,
  deactivateUser
} from '../controllers/userController.js';
import {
  validateRoleParam,
  validateProfileUpdate
} from '../middlewares/validation.js';
import { catchAsync } from '../middlewares/errorHandler.js';

const router = Router();
router.get(
  '/me',
  authenticate,
  catchAsync(getCurrentUser)
);
router.get(
  '/role/:role',
  authenticate,
  authorize(['admin']),
  validateRoleParam,
  catchAsync(getUsersByRole)
);
router.patch(
  '/me',
  authenticate,
  checkTokenFreshness(5),
  validateProfileUpdate,
  catchAsync(updateUserProfile)
);
router.post(
  '/me/deactivate',
  authenticate,
  checkTokenFreshness(5),
  catchAsync(deactivateUser)
);

export default router;