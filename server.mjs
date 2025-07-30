import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';  // Changed import style
import cors from 'cors';

// Import routes using file extensions
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import wasteRoutes from './routes/waste.js';
import userRoutes from './routes/users.js';

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: ctrue
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});