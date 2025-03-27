const QRCode = require('qrcode');
const winston = require('winston');
const crypto = require('crypto');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'qrcode.log' })
  ]
});

// Generate a QR code for a ticket
const generateTicketQR = async (ticketId, eventId, userId) => {
  try {
    // Generate a validation code
    const validationCode = generateValidationCode();
    
    // Create the data to be encoded in the QR code
    const qrData = {
      ticketId,
      eventId,
      userId,
      validationCode,
      timestamp: Date.now()
    };
    
    // Convert to JSON string
    const qrDataString = JSON.stringify(qrData);
    
    // Generate QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrDataString);
    
    logger.info(`QR code generated for ticket: ${ticketId}`);
    
    return {
      qrCodeDataUrl,
      validationCode
    };
  } catch (error) {
    logger.error(`Error generating QR code: ${error.message}`);
    throw error;
  }
};

// Generate a random validation code
const generateValidationCode = () => {
  // Generate a 6-character alphanumeric code
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Validate a ticket QR code
const validateTicketQR = (qrData, ticket) => {
  try {
    // Parse QR data
    const parsedQRData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    // Check if ticket IDs match
    if (parsedQRData.ticketId !== ticket.id) {
      logger.warn(`QR validation failed: Ticket ID mismatch for ticket ${ticket.id}`);
      return false;
    }
    
    // Check if event IDs match
    if (parsedQRData.eventId !== ticket.eventId) {
      logger.warn(`QR validation failed: Event ID mismatch for ticket ${ticket.id}`);
      return false;
    }
    
    // Check if user IDs match
    if (parsedQRData.userId !== ticket.userId) {
      logger.warn(`QR validation failed: User ID mismatch for ticket ${ticket.id}`);
      return false;
    }
    
    // Check if validation code matches
    if (parsedQRData.validationCode !== ticket.validationCode) {
      logger.warn(`QR validation failed: Validation code mismatch for ticket ${ticket.id}`);
      return false;
    }
    
    logger.info(`QR code validated successfully for ticket: ${ticket.id}`);
    return true;
  } catch (error) {
    logger.error(`Error validating QR code: ${error.message}`);
    return false;
  }
};

module.exports = {
  generateTicketQR,
  validateTicketQR
};

