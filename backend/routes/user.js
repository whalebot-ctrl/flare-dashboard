import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all users (for testing only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select(
      '-password -verificationToken -verificationTokenExpires'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile by email (for development)
router.get('/me', async (req, res) => {
  try {
    const email = req.headers['x-user-email'];

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email is required in x-user-email header' });
    }

    console.log(`Looking up user with email: ${email}`);

    const user = await User.findOne({ email }).select(
      '-password -verificationToken -verificationTokenExpires'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response to match the frontend expectations
    const profileData = {
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      username:
        user.firstName.toLowerCase() +
        (user.lastName ? user.lastName.charAt(0).toLowerCase() : ''),
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      profileImage: user.profileImage || '/placeholder.svg?height=96&width=96',
      isVerified: user.isVerified,
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (for admin purposes)
router.get('/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.userId).select(
      '-password -verificationToken -verificationTokenExpires'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response to match the frontend expectations
    const profileData = {
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      username:
        user.firstName.toLowerCase() +
        (user.lastName ? user.lastName.charAt(0).toLowerCase() : ''),
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      profileImage: user.profileImage || '/placeholder.svg?height=96&width=96',
      isVerified: user.isVerified,
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  try {
    const email = req.headers['x-user-email'];

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email is required in x-user-email header' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email: newEmail, phone, location, username } = req.body;

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    if (newEmail) user.email = newEmail;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    // Save the updated user
    await user.save();

    // Return formatted profile data
    const profileData = {
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      username,
      email: user.email,
      phone: user.phone,
      location: user.location,
      profileImage: user.profileImage || '/placeholder.svg?height=96&width=96',
      isVerified: user.isVerified,
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile image
router.put('/me/image', async (req, res) => {
  try {
    const email = req.headers['x-user-email'];

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email is required in x-user-email header' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { profileImage } = req.body;
    user.profileImage = profileImage;
    await user.save();

    res.json({ profileImage });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
