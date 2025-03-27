const express = require('express');
const { body } = require('express-validator');
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

// Reserve a ticket
router.post(
  '/events/:eventId/tickets/reserve',
  [
    verifyToken
  ],
  ticketController.reserveTicket
);

// Purchase a ticket
router.post(
  '/tickets/:ticketId/purchase',
  [
    verifyToken,
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('paymentReference').notEmpty().withMessage('Payment reference is required')
  ],
  ticketController.purchaseTicket
);

// Get user tickets
router.get(
  '/users/:userId/tickets',
  [
    verifyToken
  ],
  ticketController.getUserTickets
);

// Get my tickets
router.get(
  '/my/tickets',
  [
    verifyToken
  ],
  (req, res) => {
    req.params.userId = req.user.id;
    return ticketController.getUserTickets(req, res);
  }
);

// Validate a ticket
router.post(
  '/tickets/:ticketId/validate',
  [
    verifyToken,
    checkRole(['admin', 'organizer']),
    body('qrData').notEmpty().withMessage('QR data is required')
  ],
  ticketController.validateTicket
);

// Get event tickets
router.get(
  '/events/:eventId/tickets',
  [
    verifyToken,
    checkRole(['admin', 'organizer'])
  ],
  ticketController.getEventTickets
);

// Cancel a ticket
router.post(
  '/tickets/:ticketId/cancel',
  [
    verifyToken
  ],
  ticketController.cancelTicket
);

module.exports = router;

