import WasteReport from '../models/WasteReport.js';
import WasteSchedule from '../models/WasteSchedule.js';
import User from '../models/User.js';

// Environment variables
const POINTS_FOR_REPORT = process.env.POINTS_FOR_REPORT || 1;

export const reportWaste = async (req, res) => {
  const { description, location } = req.body;
  
  // Input validation
  if (!description || !location) {
    return res.status(400).json({ error: 'Description and location are required' });
  }

  try {
    // Transaction for atomic operations
    const session = await User.startSession();
    session.startTransaction();
    
    try {
      // Create report
      const newReport = new WasteReport({
        user: req.user.id,
        description,
        location,
        status: 'pending' // Default status
      });

      // Update user points
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { points: POINTS_FOR_REPORT } },
        { session }
      );

      const report = await newReport.save({ session });
      await session.commitTransaction();
      
      res.status(201).json({
        ...report.toObject(),
        pointsAwarded: POINTS_FOR_REPORT
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error('Waste report error:', err.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const schedulePickup = async (req, res) => {
  const { collectorId, date, pointsUsed } = req.body;
  
  // Validation
  if (!collectorId || !date || !pointsUsed) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await User.startSession();
    session.startTransaction();
    
    try {
      // Verify collector exists
      const collector = await User.findById(collectorId).session(session);
      if (!collector || collector.role !== 'collector') {
        return res.status(400).json({ error: 'Invalid collector' });
      }

      // Check and deduct points
      const user = await User.findById(req.user.id).session(session);
      if (user.points < pointsUsed) {
        return res.status(400).json({ 
          error: 'Insufficient points',
          currentPoints: user.points,
          requiredPoints: pointsUsed
        });
      }

      user.points -= pointsUsed;
      await user.save({ session });

      // Create schedule
      const newSchedule = new WasteSchedule({
        user: req.user.id,
        collector: collectorId,
        date: new Date(date),
        pointsUsed,
        status: 'scheduled'
      });

      const schedule = await newSchedule.save({ session });
      await session.commitTransaction();
      
      res.status(201).json({
        ...schedule.toObject(),
        remainingPoints: user.points
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error('Schedule pickup error:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('collector', 'name email')
      .lean();
    
    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};