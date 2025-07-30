const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const eventController = require('../controllers/eventController');

// POST /api/events - Create new event
router.post('/', auth, eventController.createEvent);

// GET /api/events - Get all events
router.get('/', eventController.getEvents);

// GET /api/events/my-events - Get user's events
router.get('/my-events', auth, eventController.getUserEvents);

module.exports = router;