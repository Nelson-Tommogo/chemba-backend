const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
  createEvent, 
  getEvents,
  getUserEvents
} = require('../controllers/eventController');

router.post('/', auth, createEvent);
router.get('/', getEvents);
router.get('/my-events', auth, getUserEvents);

module.exports = router;