const WasteReport = require('../models/WasteReport');
const WasteSchedule = require('../models/WasteSchedule');
const User = require('../models/User');

exports.reportWaste = async (req, res) => {
  const { description, location } = req.body;
  
  try {
    const newReport = new WasteReport({
      user: req.user.id,
      description,
      location
    });

    // Add points to user
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    const report = await newReport.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.schedulePickup = async (req, res) => {
  const { collectorId, date, pointsUsed } = req.body;
  
  try {
    // Check if user has enough points
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
};

exports.getUserReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};