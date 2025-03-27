const { StatusCodes } = require('http-status-codes');
const { verifyAccessToken } = require('../utils/jwt');
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

exports.verifyToken = (req, res, next) => {
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Verify token
  const { valid, decoded, error } = verifyAccessToken(token);
  
  if (!valid) {
    logger.warn(`Invalid token: ${error}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid token',
      error
    });
  }
  
  
  req.user = decoded;
  
  next();
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

