import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import wasteRoutes from './routes/waste.js';
import userRoutes from './routes/users.js';

// Test MongoDB Connection
async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log('✅ MongoDB connection test successful');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB connection test failed:', err.message);
    process.exit(1);
  }
}

// Test Cloudinary Connection
async function testCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    await cloudinary.api.resources({ max_results: 1 });
    console.log('✅ Cloudinary connection test successful');
  } catch (err) {
    console.error('❌ Cloudinary connection test failed:', err.message);
    process.exit(1);
  }
}

// Run connection tests before starting server
async function runTests() {
  console.log('Running connection tests...');
  await testMongoDB();
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    await testCloudinary();
  } else {
    console.log('ℹ️ Cloudinary config missing - skipping test');
  }
}

// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured'
    }
  });
});

// Main routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/users', userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

runTests().then(() => {
  // Reconnect MongoDB after tests
  mongoose.connect(process.env.MONGO_URI);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
  });
});