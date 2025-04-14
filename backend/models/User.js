import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: { type: Date },
  phone: String,
  location: String,
  profileImage: String,
  // Add any other fields you need for your user profile
});

const User = mongoose.model('User', userSchema);

export default User;
