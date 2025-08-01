import Event from '../models/Event.js';  // Only import the default export
import upload from '../utils/upload.js';

export const createEvent = async (req, res) => {
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

export const getEvents = async (req, res) => {
  try {
    // Call find() on the Event model directly
    const events = await Event.find().populate('organizer', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Export as named exports
export default {
  createEvent,
  getEvents
};