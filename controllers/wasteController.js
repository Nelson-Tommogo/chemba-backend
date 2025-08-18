import WasteReport from '../models/WasteReport.js';
import WasteSchedule from '../models/WasteSchedule.js';
import User from '../models/User.js';

// Environment variables
const POINTS_FOR_REPORT = process.env.POINTS_FOR_REPORT || 1;

// Main controller functions
export const createWasteReport = async (req, res) => {
  const { description, location } = req.body;
  
  if (!description || !location) {
    return res.status(400).json({ error: 'Description and location are required' });
  }

  try {
    const session = await User.startSession();
    session.startTransaction();
    
    try {
      const newReport = new WasteReport({
        user: req.user.id,
        description,
        location,
        status: 'pending'
      });

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
  
  if (!collectorId || !date || !pointsUsed) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await User.startSession();
    session.startTransaction();
    
    try {
      const collector = await User.findById(collectorId).session(session);
      if (!collector || collector.role !== 'collector') {
        return res.status(400).json({ error: 'Invalid collector' });
      }

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

export const deleteWasteReport = async (req, res) => {
  try {
    const report = await WasteReport.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found or unauthorized' });
    }

    if (process.env.REFUND_ON_DELETE === 'true') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { points: -POINTS_FOR_REPORT } }
      );
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Delete report error:', err.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getAllWasteReports = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'collector') {
      query = {
        ...query,
        status: 'pending',
      };
    }

    const reports = await WasteReport.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();

    res.json(reports);
  } catch (err) {
    console.error('Get all reports error:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const updateWasteReport = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'location', 'status', 'wasteType'];
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const report = await WasteReport.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found or unauthorized' });
    }

    res.json(report);
  } catch (err) {
    console.error('Update report error:', err.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getWasteReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate('user', 'name email')
      .populate('collector', 'name email');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (req.user.role === 'user' && !report.user._id.equals(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(report);
  } catch (err) {
    console.error('Get report by ID error:', err.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Aliases for route compatibility
export const reportWaste = createWasteReport;
export const getReportDetails = getWasteReportById;
export const updateReportStatus = updateWasteReport;