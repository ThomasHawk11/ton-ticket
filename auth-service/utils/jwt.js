const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const RefreshToken = db.refreshToken;

// Generate JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    {
      expiresIn: '1h' // Access token expires in 1 hour
    }
  );
};

// Generate refresh token
const generateRefreshToken = async (userId) => {
  try {
    // Create a new refresh token
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // Refresh token expires in 7 days
    
    const token = uuidv4();
    
    // Save the refresh token in the database
    const refreshToken = await RefreshToken.create({
      token: token,
      userId: userId,
      expiryDate: expiry
    });
    
    return refreshToken.token;
  } catch (error) {
    throw new Error(`Error generating refresh token: ${error.message}`);
  }
};

// Verify JWT access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
  try {
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    
    if (!refreshToken) {
      return { valid: false, error: 'Invalid refresh token' };
    }
    
    // Check if token is expired
    if (refreshToken.isExpired()) {
      await refreshToken.destroy(); // Remove expired token
      return { valid: false, error: 'Refresh token expired' };
    }
    
    // Get the user associated with this token
    const user = await db.user.findByPk(refreshToken.userId);
    
    if (!user) {
      return { valid: false, error: 'User not found' };
    }
    
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

