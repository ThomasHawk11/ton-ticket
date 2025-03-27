const express = require('express');
const { body } = require('express-validator');
const venueController = require('../controllers/venue.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

// Create a new venue
router.post(
  '/',
  [
    verifyToken,
    checkRole(['admin']),
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('postalCode').notEmpty().withMessage('Postal code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
  ],
  venueController.createVenue
);

// Get all venues with pagination and filtering
router.get('/', venueController.getAllVenues);

// Get venue by ID
router.get('/:id', venueController.getVenueById);

// Update venue
router.put(
  '/:id',
  [
    verifyToken,
    checkRole(['admin']),
    body('name').optional(),
    body('address').optional(),
    body('city').optional(),
    body('postalCode').optional(),
    body('country').optional(),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
  ],
  venueController.updateVenue
);

// Delete venue
router.delete(
  '/:id',
  [
    verifyToken,
    checkRole(['admin'])
  ],
  venueController.deleteVenue
);

// Get events by venue
router.get(
  '/:id/events',
  [
    verifyToken
  ],
  venueController.getEventsByVenue
);

module.exports = router;

