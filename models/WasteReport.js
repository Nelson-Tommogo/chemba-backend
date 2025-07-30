import { Schema, model } from 'mongoose';

const WasteReportSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  description: { type: String, required: true },
  location: { type: String, required: true },
  pointsEarned: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

export default model('WasteReport', WasteReportSchema);