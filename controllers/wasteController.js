import WasteReport from '../models/WasteReport.js';
import WasteSchedule from '../models/WasteSchedule.js';
import User from '../models/User.js';

export async function reportWaste(req, res) {
  const { description, location } = req.body;
  
  try {
    const newReport = new WasteReport({
      user: req.user.id,
      description,
      location
    });

    // Add points to user using User model
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    const report = await newReport.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);c
    res.status(500).send('Server error');
  }
}

export async function schedulePickup(req, res) {
  const { collectorId, date, pointsUsed } = req.body;
  
  try {
    // Check if user has enough points using User model
    const user = await User.findById(req.user.id);
    if (user.points < pointsUsed) {
      return res.status(400).json({ msg: 'Not enough points' });
    }

    // Deduct points
    user.points -= pointsUsed;
    await user.save();

    const newSchedule = new WasteSchedule({
      user: req.user.id,
      collector: collectorId,
      date,
      pointsUsed
    });

    const schedule = await newSchedule.save();
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

export async function getUserReports(req, res) {
  try {
    // Use WasteReport model directly
    const reports = await WasteReport.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}