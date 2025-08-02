// routes/waste.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import upload from '../utils/upload.js';
import {
  createWaste,
  getWaste,
  getUserWaste
} from '../controllers/wasteController.js';

const router = Router();

const verifyImport = (imported, name) => {
  if (typeof imported !== 'function') {
    throw new Error(`Expected function for ${name} but got ${typeof imported}`);
  }
  return imported;
};

// Verify imports
verifyImport(auth, 'auth middleware');
verifyImport(upload.single, 'upload.single middleware');
verifyImport(createWaste, 'createWaste controller');
verifyImport(getWaste, 'getWaste controller');
verifyImport(getUserWaste, 'getUserWaste controller');

// Routes
router.post(
  '/',
  auth,
  upload.single('image'),
  createWaste
);

router.get('/', getWaste);

router.get(
  '/my-waste',
  auth,
  getUserWaste
);

export default router;
