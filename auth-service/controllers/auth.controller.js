const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const db = require('../models');
const User = db.user;
const RefreshToken = db.refreshToken;
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { publishToQueue } = require('../utils/rabbitmq');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'auth.log' })
  ]
});

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'Username or email already exists'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await publishToQueue('user_created', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
    
    logger.info(`User registered: ${user.id}`);
    
    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({
      where: { email }
    });
    
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Account is disabled'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid email or password'
      });
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);
    
    await user.update({ lastLogin: new Date() });
    
    logger.info(`User logged in: ${user.id}`);
    
    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error during login',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Refresh token is required'
      });
    }
    
    const { valid, error, user } = await verifyRefreshToken(refreshToken);
    
    if (!valid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid refresh token',
        error
      });
    }
    
    const accessToken = generateAccessToken(user);
    
    logger.info(`Token refreshed for user: ${user.id}`);
    
    res.status(StatusCodes.OK).json({
      accessToken
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error refreshing token',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Refresh token is required'
      });
    }
    
    const token = await RefreshToken.findOne({ where: { token: refreshToken } });
    
    if (!token) {
      return res.status(StatusCodes.OK).json({
        message: 'Logout successful'
      });
    }
    
    await token.destroy();
    
    logger.info(`User logged out: ${token.userId}`);
    
    res.status(StatusCodes.OK).json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    logger.error(`Token validation error: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error validating token',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};
