import { Router } from 'express';
const router = Router();
import auth from '../middlewares/auth.js';
import { authorize } from '../middlewares/auth.js';
import { getUsersByRole, getCurrentUser } from '../controllers/userController.js';

router.get('/me', auth, getCurrentUser);
router.get('/role/:role', auth, authorize(['admin']), getUsersByRole);

export default router;