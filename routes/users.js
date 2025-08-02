import { Router } from 'express';
const router = Router();
import { auth, authorize } from '../middlewares/auth.js';
import { getUsersByRole, getCurrentUser } from '../controllers/userController.js';

// GET /api/users/me - Get current user's profile
router.get('/me', auth, getCurrentUser);

// GET /api/users/role/:role - Get users by role (admin only)
router.get('/role/:role', 
  auth, 
  authorize(['admin']), // Array of allowed roles
  getUsersByRole
);

export default router;