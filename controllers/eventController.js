const Event = require('../models/Event');
const upload = require('../utils/upload');

// Create event with image upload
exports.createEvent = [
  upload.single('image'),
  async (req, res) => {
    const { title, description, date, location } = req.body;
    
    try {
      const eventData = {
        title,
        description,
        date,
        location,
        organizer: req.user.id
      };

      if (req.file) {
        eventData.image = {
          public_id: req.file.public_id,
          url: req.file.path
        };
      }

      const newEvent = new Event(eventData);
      const event = await newEvent.save();
      
      res.status(201).json({
        success: true,
        event
      });
    } catch (err) {
      // Delete uploaded image if event creation fails
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
];

// Get all events (updated to include images)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 })
      .populate('organizer', 'name role');
    
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};