import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://flare-dashboard-ebon.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment variables
console.log('Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Defined' : '❌ Missing');
console.log(
  'JWT_SECRET:',
  process.env.JWT_SECRET ? '✅ Defined' : '❌ Missing'
);
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log(
  'FRONTEND_URL:',
  process.env.FRONTEND_URL || 'http://localhost:3000 (default)'
);

// Connect to MongoDB with error handling
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in your environment variables');
  console.log(
    'Please create a .env file in your backend directory with the following content:'
  );
  console.log('MONGO_URI=mongodb://localhost:27017/investment-dashboard');
  console.log('JWT_SECRET=your_jwt_secret_key_here');
  console.log('PORT=5000');
  console.log('FRONTEND_URL=http://localhost:3000');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Crash the app if DB fails
  });

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Add a test route for the mock user
app.get('/api/test-mock-user', (req, res) => {
  res.json({
    message: 'This is a test endpoint for the mock user',
    mockUserId: 'mockUserId123',
    endpoint: '/api/users/mockUserId123',
  });
});

// Dynamically import routes
const routesDir = path.join(__dirname, 'routes');

// Check if routes directory exists
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
  console.log('Created routes directory');
}

// Import auth routes
try {
  const authRoutes = await import('./routes/auth.js');
  app.use('/api/auth', authRoutes.default);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.warn('⚠️ Auth routes not found or error loading:', error.message);
}

// Import user routes
try {
  const userRoutes = await import('./routes/users.js');
  app.use('/api/users', userRoutes.default);
  console.log('✅ User routes loaded');
} catch (error) {
  console.warn('⚠️ User routes not found or error loading:', error.message);
  // Create the users.js file if it doesn't exist
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('Creating users.js file...');
    const usersRoutePath = path.join(__dirname, 'routes', 'users.js');
    fs.writeFileSync(
      usersRoutePath,
      `
import express from "express"
import User from "../models/User.js"
import mongoose from "mongoose"

const router = express.Router()

// Get user profile by email (for development)
router.get("/me", async (req, res) => {
  try {
    const email = req.headers["x-user-email"]
    
    if (!email) {
      return res.status(400).json({ message: "Email is required in x-user-email header" })
    }
    
    console.log(\`Looking up user with email: \${email}\`)
    
    const user = await User.findOne({ email }).select("-password -verificationToken -verificationTokenExpires")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Format the response to match the frontend expectations
    const profileData = {
      name: \`\${user.firstName} \${user.lastName || ""}\`.trim(),
      username: user.firstName.toLowerCase() + (user.lastName ? user.lastName.charAt(0).toLowerCase() : ""),
      email: user.email,
      phone: user.phone || "",
      location: user.location || "",
      profileImage: user.profileImage || "/placeholder.svg?height=96&width=96",
      isVerified: user.isVerified,
    }
    
    res.json(profileData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
    `
    );
    console.log('✅ Created users.js file with /me endpoint');
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/api/test-mock-user`);
});
