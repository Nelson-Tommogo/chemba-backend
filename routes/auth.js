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
import { 
  catchAsync 
} from '../middlewares/auth.js';

const router = Router();

router.use(authLimiter);
router.post(
  '/register',
  validateRegister,
  catchAsync(register)
);
router.post(
  '/login',
  validateLogin,
  catchAsync(login)
);
router.post(
  '/logout',
  authenticate,
  catchAsync(logout)
);
router.post(
  '/refresh-token',
  validateRefreshToken,
  catchAsync(refreshToken)
);

export default router;