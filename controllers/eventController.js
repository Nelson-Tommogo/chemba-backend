import Event, { find } from '../models/Event.js';
import upload from '../utils/upload.js';

const createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id,
      image: req.file ? req.file.path : null
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await find().populate('organizer', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  createEvent,
  getEvents
};