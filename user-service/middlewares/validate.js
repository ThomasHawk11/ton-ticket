const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

 to validate request data
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation error',
      errors: errors.array()
    });
  }
  
  next();
};

