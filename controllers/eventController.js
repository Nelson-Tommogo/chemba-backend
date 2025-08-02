import Event from '../models/Event.js';

// Create Event (must be a function, not object)
export const createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id,
      image: req.file?.path || null // Cloudinary URL
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }c
};

// Get User's Events
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
                            .populate('organizer', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};