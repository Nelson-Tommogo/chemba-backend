import mongoose from 'mongoose';
import { WasteType, ReportStatus } from '../constants/enums.js';

const wasteReportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  wasteType: {
    type: String,
    enum: Object.values(WasteType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ReportStatus),
    default: ReportStatus.PENDING
  },
  quantity: {
    type: Number,
    min: 0.1,
    max: 1000
  },
  imageUrl: String,
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledDate: Date,
  pointsUsed: Number,
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

wasteReportSchema.index({ location: '2dsphere' });

// ✅ Export enums so validator can import them from c
export { WasteType, ReportStatus };

export default mongoose.model('WasteReport', wasteReportSchema);
