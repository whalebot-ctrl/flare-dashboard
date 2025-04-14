import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from '../models/User.js';

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in your environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create a test user
const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({
      email: 'alex.johnson@example.com',
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log(`User ID: ${existingUser._id}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Name: ${existingUser.firstName} ${existingUser.lastName}`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create new user
    const user = new User({
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      password: hashedPassword,
      isVerified: true,
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      profileImage: '/placeholder.svg?height=96&width=96',
    });

    await user.save();

    console.log('✅ Test user created successfully');
    console.log(`User ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);

    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

// Run the function
createTestUser();
