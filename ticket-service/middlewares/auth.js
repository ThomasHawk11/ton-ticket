const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
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

exports.verifyToken = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
    
    const response = await axios.post(`${authServiceUrl}/api/auth/validate-token`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    
    req.user = response.data.user;
    
    next();
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid token'
    });
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.id} with role ${req.user.role}`);
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }
    
    next();
  };
};

