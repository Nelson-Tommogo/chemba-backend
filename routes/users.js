const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
  reportWaste, 
  schedulePickup,
  getUserReports
} = require('../controllers/wasteController');

router.post('/report', auth, reportWaste);
router.post('/schedule', auth, schedulePickup);
router.get('/my-reports', auth, getUserReports);

module.exports = router;