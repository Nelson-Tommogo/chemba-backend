const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { authorize } = require('../middlewares/auth');
const { 
  getUsersByRole,
  getCurrentUser
} = require('../controllers/userController');

router.get('/me', auth, getCurrentUser);
router.get('/role/:role', auth, authorize(['admin']), getUsersByRole);

module.exports = router;