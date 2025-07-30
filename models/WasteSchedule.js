import { Schema, model } from 'mongoose';

const WasteScheduleSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  collector: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  pointsUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default model('WasteSchedule', WasteScheduleSchema);