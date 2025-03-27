const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/event.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

// Get event categories - Doit être défini avant la route avec paramètre :id
router.get('/categories', eventController.getCategories);

// Get featured events for homepage - Doit être défini avant la route avec paramètre :id
router.get('/featured', eventController.getFeaturedEvents);

// Create a new event
router.post(
  '/',
  [
    verifyToken,
    checkRole(['admin', 'organizer']),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('venueId').notEmpty().withMessage('Venue ID is required'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('ticketsAvailable').isInt({ min: 1 }).withMessage('Tickets available must be a positive integer'),
    body('ticketPrice').isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number')
  ],
  eventController.createEvent
);

// Get all events with pagination and filtering
router.get('/', eventController.getAllEvents);

// Get event by ID - Doit être défini après les routes spécifiques
router.get('/:id', eventController.getEventById);

// Update event
router.put(
  '/:id',
  [
    verifyToken,
    checkRole(['admin', 'organizer']),
    body('title').optional(),
    body('description').optional(),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('venueId').optional(),
    body('categoryId').optional(),
    body('status').optional().isIn(['draft', 'published', 'cancelled']).withMessage('Status must be draft, published, or cancelled'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('ticketsAvailable').optional().isInt({ min: 0 }).withMessage('Tickets available must be a non-negative integer'),
    body('ticketPrice').optional().isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number')
  ],
  eventController.updateEvent
);

// Cancel event
router.put(
  '/:id/cancel',
  [
    verifyToken,
    checkRole(['admin', 'organizer'])
  ],
  eventController.cancelEvent
);

// Add image to event
router.post(
  '/:id/images',
  [
    verifyToken,
    checkRole(['admin', 'organizer']),
    body('imageUrl').notEmpty().withMessage('Image URL is required'),
    body('caption').optional(),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
  ],
  eventController.addEventImage
);

// Get events by organizer
router.get(
  '/organizers/:organizerId',
  [
    verifyToken
  ],
  eventController.getEventsByOrganizer
);

module.exports = router;

