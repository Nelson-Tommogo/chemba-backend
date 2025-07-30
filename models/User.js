import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password in queries
  },
  role: { 
    type: String, 
    required: [true, 'Role is required'],
    enum: {
      values: ['user', 'startup', 'government', 'collector'],
      message: 'Invalid role specified'
    }
  },
  points: { 
    type: Number, 
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  location: { 
    type: String,
    trim: true
  },
  contact: { 
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for profile URL
UserSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}/profile`;
});

const User = model('User', UserSchema);

export default User;