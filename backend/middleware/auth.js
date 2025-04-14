import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// For development/testing - get current user without token
export const getCurrentUser = async (req, res, next) => {
  // Check if there's a token first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      return next();
    } catch (error) {
      // If token verification fails, continue with email lookup
    }
  }

  // For development - allow email in header to identify user
  const email = req.headers['x-user-email'];
  if (email) {
    req.userEmail = email;
  }

  next();
};
