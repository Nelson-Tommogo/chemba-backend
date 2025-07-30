const mongoose = require('mongoose');

const WasteReportSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  description: { type: String, required: true },
  location: { type: String, required: true },
  pointsEarned: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WasteReport', WasteReportSchema);