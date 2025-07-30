import { Schema, model } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  image: {
    public_id: { type: String },
    url: { type: String }
  },
  organizer: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

export default model('Event', EventSchema);