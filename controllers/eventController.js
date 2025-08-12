import Event from '../models/Event.js';

// Create Event
export const createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id,
      image: req.file?.path || null // Cloudinary URL or null if no file
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ 
      error: err.message,
      details: err.errors // Adds validation error details
    });
  }
};

// Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 }); // Newest first
    res.json(events);
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
};

// Get User's Events
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'name email')
      .sort({ date: 1 }); // Sort by event date
    res.json(events);
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
};