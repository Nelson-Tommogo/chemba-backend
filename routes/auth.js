import { Router } from 'express';
import { 
  register, 
  login,
  logout,
  refreshToken
} from '../controllers/authController.js';
import { 
  validateRegister, 
  validateLogin,
  validateRefreshToken
} from '../middlewares/validation.js';
import { 
  authenticate, 
  authLimiter 
} from '../middlewares/auth.js';
import { catchAsync } from '../middlewares/error.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Registration route with validation
router.post(
  '/register',
  validateRegister,
  catchAsync(register)
);

// Login route with validation
router.post(
  '/login', 
  validateLogin,
  catchAsync(login)
);

// Logout route (requires authentication)
router.post(
  '/logout',
  authenticate,
  catchAsync(logout)
);

// Token refresh route
router.post(
  '/refresh-token',
  validateRefreshToken,
  catchAsync(refreshToken)
);

export default router;