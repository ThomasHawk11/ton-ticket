const { StatusCodes } = require('http-status-codes');
const db = require('../models');
const Ticket = db.ticket;
const TicketInventory = db.ticketInventory;
const TicketTransaction = db.ticketTransaction;
const { publishToQueue } = require('../utils/rabbitmq');
const { generateTicketQR, validateTicketQR } = require('../utils/qrcode');
const winston = require('winston');
const axios = require('axios');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'ticket.log' })
  ]
});

// Create ticket inventory when an event is created
exports.createTicketInventory = async (eventData) => {
  try {
    const {
      id: eventId,
      ticketsAvailable,
      ticketPrice,
      currency,
      startDate
    } = eventData;

    // Calculate sale start and end dates (e.g., start now, end 1 day before event)
    const now = new Date();
    const eventStartDate = new Date(startDate);
    const saleEndDate = new Date(eventStartDate);
    saleEndDate.setDate(saleEndDate.getDate() - 1);

    // Create ticket inventory
    const ticketInventory = await TicketInventory.create({
      eventId,
      totalTickets: ticketsAvailable,
      availableTickets: ticketsAvailable,
      basePrice: ticketPrice,
      currency: currency || 'EUR',
      saleStartDate: now,
      saleEndDate,
      status: 'active'
    });

    logger.info(`Ticket inventory created for event: ${eventId}`);

    // Create individual tickets
    const ticketPromises = [];
    for (let i = 0; i < ticketsAvailable; i++) {
      ticketPromises.push(
        Ticket.create({
          eventId,
          inventoryId: ticketInventory.id,
          status: 'available',
          price: ticketPrice,
          currency: currency || 'EUR',
          seatInfo: { row: Math.floor(i / 10) + 1, seat: (i % 10) + 1 }
        })
      );
    }

    await Promise.all(ticketPromises);
    logger.info(`Created ${ticketsAvailable} tickets for event: ${eventId}`);

    return ticketInventory;
  } catch (error) {
    logger.error(`Error creating ticket inventory: ${error.message}`);
    throw error;
  }
};

// Update ticket inventory when an event is updated
exports.updateTicketInventory = async (eventData) => {
  try {
    const {
      id: eventId,
      ticketsAvailable,
      ticketPrice,
      currency,
      status
    } = eventData;

    // Find existing inventory
    const inventory = await TicketInventory.findOne({
      where: { eventId }
    });

    if (!inventory) {
      logger.error(`No ticket inventory found for event: ${eventId}`);
      return null;
    }

    // If event is cancelled, cancel all tickets
    if (status === 'cancelled') {
      await this.cancelTickets(eventData);
      return;
    }

    // Calculate difference in available tickets
    const currentTotal = inventory.totalTickets;
    const diff = ticketsAvailable - currentTotal;

    // Update inventory
    await inventory.update({
      totalTickets: ticketsAvailable,
      availableTickets: inventory.availableTickets + diff,
      basePrice: ticketPrice || inventory.basePrice,
      currency: currency || inventory.currency
    });

    // If more tickets are needed, create them
    if (diff > 0) {
      const ticketPromises = [];
      for (let i = 0; i < diff; i++) {
        ticketPromises.push(
          Ticket.create({
            eventId,
            inventoryId: inventory.id,
            status: 'available',
            price: ticketPrice || inventory.basePrice,
            currency: currency || inventory.currency,
            seatInfo: { row: Math.floor((currentTotal + i) / 10) + 1, seat: ((currentTotal + i) % 10) + 1 }
          })
        );
      }

      await Promise.all(ticketPromises);
      logger.info(`Created ${diff} additional tickets for event: ${eventId}`);
    }

    // If ticket price changed, update all available tickets
    if (ticketPrice && ticketPrice !== inventory.basePrice) {
      await Ticket.update(
        { price: ticketPrice },
        {
          where: {
            eventId,
            status: 'available'
          }
        }
      );
      logger.info(`Updated price for available tickets of event: ${eventId}`);
    }

    logger.info(`Ticket inventory updated for event: ${eventId}`);
    return inventory;
  } catch (error) {
    logger.error(`Error updating ticket inventory: ${error.message}`);
    throw error;
  }
};

// Cancel all tickets for an event
exports.cancelTickets = async (eventData) => {
  try {
    const { id: eventId } = eventData;

    // Find existing inventory
    const inventory = await TicketInventory.findOne({
      where: { eventId }
    });

    if (!inventory) {
      logger.error(`No ticket inventory found for event: ${eventId}`);
      return null;
    }

    // Update inventory status
    await inventory.update({
      status: 'closed',
      availableTickets: 0,
      cancelledTickets: inventory.totalTickets - inventory.soldTickets
    });

    // Update all available and reserved tickets to cancelled
    await Ticket.update(
      { status: 'cancelled' },
      {
        where: {
          eventId,
          status: ['available', 'reserved']
        }
      }
    );

    // For purchased tickets, we need to handle refunds and notifications
    const purchasedTickets = await Ticket.findAll({
      where: {
        eventId,
        status: 'purchased'
      }
    });

    // Process each purchased ticket
    for (const ticket of purchasedTickets) {
      // Create a cancellation transaction
      await TicketTransaction.create({
        ticketId: ticket.id,
        userId: ticket.userId,
        type: 'cancellation',
        amount: ticket.price,
        currency: ticket.currency,
        status: 'completed',
        metadata: {
          reason: 'Event cancelled',
          eventId
        }
      });

      // Update ticket status
      await ticket.update({ status: 'cancelled' });

      // Send notification to user
      await publishToQueue('notification_event', {
        type: 'event_cancelled',
        userId: ticket.userId,
        eventId,
        ticketId: ticket.id,
        message: `The event you purchased tickets for has been cancelled. A refund will be processed.`
      });
    }

    logger.info(`All tickets cancelled for event: ${eventId}`);
    return true;
  } catch (error) {
    logger.error(`Error cancelling tickets: ${error.message}`);
    throw error;
  }
};

// Reserve a ticket
exports.reserveTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and is active by calling Event service
    try {
      const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3004';
      const eventResponse = await axios.get(`${eventServiceUrl}/api/events/${eventId}`, {
        headers: {
          Authorization: req.headers.authorization
        }
      });

      const event = eventResponse.data.event;
      if (event.status !== 'published') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Event is not available for ticket purchases'
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'Event not found'
        });
      }
      throw error;
    }

    // Find ticket inventory
    const inventory = await TicketInventory.findOne({
      where: { eventId, status: 'active' }
    });

    if (!inventory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No active ticket inventory found for this event'
      });
    }

    // Check if tickets are available
    if (inventory.availableTickets <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No tickets available for this event'
      });
    }

    // Find an available ticket
    const ticket = await Ticket.findOne({
      where: {
        eventId,
        status: 'available'
      }
    });

    if (!ticket) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No tickets available for this event'
      });
    }

    // Reserve the ticket
    await ticket.update({
      status: 'reserved',
      userId
    });

    // Update inventory
    await inventory.update({
      availableTickets: inventory.availableTickets - 1,
      reservedTickets: inventory.reservedTickets + 1
    });

    // Create transaction record
    const transaction = await TicketTransaction.create({
      ticketId: ticket.id,
      userId,
      type: 'reservation',
      amount: ticket.price,
      currency: ticket.currency,
      status: 'completed'
    });

    // Publish message to RabbitMQ
    await publishToQueue('ticket_reserved', {
      ticketId: ticket.id,
      userId,
      eventId,
      price: ticket.price,
      currency: ticket.currency
    });

    logger.info(`Ticket ${ticket.id} reserved for user ${userId}`);

    res.status(StatusCodes.OK).json({
      message: 'Ticket reserved successfully',
      ticket,
      transaction,
      expiresIn: '15 minutes' // Reservation expiry time
    });
  } catch (error) {
    logger.error(`Error reserving ticket: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error reserving ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Purchase a ticket
exports.purchaseTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { paymentMethod, paymentReference } = req.body;
    const userId = req.user.id;

    // Find the ticket
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Ticket not found'
      });
    }

    // Check if ticket is reserved by the same user
    if (ticket.status !== 'reserved' || ticket.userId !== userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Ticket is not reserved by you'
      });
    }

    // Find ticket inventory
    const inventory = await TicketInventory.findOne({
      where: { id: ticket.inventoryId }
    });

    if (!inventory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Ticket inventory not found'
      });
    }

    // Generate QR code for the ticket
    const { qrCodeDataUrl, validationCode } = await generateTicketQR(
      ticket.id,
      ticket.eventId,
      userId
    );

    // Update ticket
    await ticket.update({
      status: 'purchased',
      purchaseDate: new Date(),
      qrCode: qrCodeDataUrl,
      validationCode
    });

    // Update inventory
    await inventory.update({
      reservedTickets: inventory.reservedTickets - 1,
      soldTickets: inventory.soldTickets + 1
    });

    // Create transaction record
    const transaction = await TicketTransaction.create({
      ticketId: ticket.id,
      userId,
      type: 'purchase',
      amount: ticket.price,
      currency: ticket.currency,
      status: 'completed',
      paymentMethod,
      paymentReference
    });

    // Publish message to RabbitMQ
    await publishToQueue('ticket_purchased', {
      ticketId: ticket.id,
      userId,
      eventId: ticket.eventId,
      price: ticket.price,
      currency: ticket.currency,
      purchaseDate: ticket.purchaseDate
    });

    // Send notification to user
    await publishToQueue('notification_event', {
      type: 'ticket_purchased',
      userId,
      eventId: ticket.eventId,
      ticketId: ticket.id,
      message: `Your ticket purchase was successful. Your ticket is now available.`
    });

    logger.info(`Ticket ${ticket.id} purchased by user ${userId}`);

    res.status(StatusCodes.OK).json({
      message: 'Ticket purchased successfully',
      ticket: {
        id: ticket.id,
        eventId: ticket.eventId,
        status: ticket.status,
        price: ticket.price,
        currency: ticket.currency,
        purchaseDate: ticket.purchaseDate,
        qrCode: qrCodeDataUrl,
        seatInfo: ticket.seatInfo
      },
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        transactionDate: transaction.transactionDate
      }
    });
  } catch (error) {
    logger.error(`Error purchasing ticket: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error purchasing ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Get user tickets
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user has permission to view tickets
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Get tickets
    const tickets = await Ticket.findAll({
      where: {
        userId,
        status: ['purchased', 'used', 'cancelled']
      },
      order: [['purchaseDate', 'DESC']]
    });

    // Fetch event details for each ticket
    const ticketsWithEventDetails = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3004';
          const eventResponse = await axios.get(`${eventServiceUrl}/api/events/${ticket.eventId}`, {
            headers: {
              Authorization: req.headers.authorization
            }
          });

          const event = eventResponse.data.event;
          return {
            id: ticket.id,
            eventId: ticket.eventId,
            status: ticket.status,
            price: ticket.price,
            currency: ticket.currency,
            purchaseDate: ticket.purchaseDate,
            qrCode: ticket.status === 'purchased' ? ticket.qrCode : null,
            seatInfo: ticket.seatInfo,
            event: {
              title: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              venue: event.venue ? {
                name: event.venue.name,
                address: event.venue.address,
                city: event.venue.city
              } : null
            }
          };
        } catch (error) {
          // If event details can't be fetched, return ticket with minimal info
          return {
            id: ticket.id,
            eventId: ticket.eventId,
            status: ticket.status,
            price: ticket.price,
            currency: ticket.currency,
            purchaseDate: ticket.purchaseDate,
            qrCode: ticket.status === 'purchased' ? ticket.qrCode : null,
            seatInfo: ticket.seatInfo,
            event: {
              title: 'Event details not available',
              startDate: null,
              endDate: null,
              venue: null
            }
          };
        }
      })
    );

    logger.info(`Retrieved ${tickets.length} tickets for user ${userId}`);

    res.status(StatusCodes.OK).json({
      tickets: ticketsWithEventDetails
    });
  } catch (error) {
    logger.error(`Error retrieving user tickets: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving user tickets',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Validate a ticket
exports.validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { qrData } = req.body;

    // Check if user has permission to validate tickets
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Find the ticket
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Ticket not found'
      });
    }

    // Check if ticket is purchased
    if (ticket.status !== 'purchased') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Ticket cannot be validated (status: ${ticket.status})`
      });
    }

    // Validate QR code
    const isValid = validateTicketQR(qrData, ticket);

    if (!isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid QR code'
      });
    }

    // Update ticket status
    await ticket.update({
      status: 'used'
    });

    // Create transaction record
    await TicketTransaction.create({
      ticketId: ticket.id,
      userId: req.user.id,
      type: 'validation',
      amount: 0,
      currency: ticket.currency,
      status: 'completed',
      metadata: {
        validatedBy: req.user.id,
        validationTime: new Date()
      }
    });

    logger.info(`Ticket ${ticket.id} validated by user ${req.user.id}`);

    res.status(StatusCodes.OK).json({
      message: 'Ticket validated successfully',
      ticket: {
        id: ticket.id,
        eventId: ticket.eventId,
        status: 'used',
        validatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error(`Error validating ticket: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error validating ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Get event tickets
exports.getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;
    
    // Check if user has permission to view event tickets
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Build query conditions
    const whereConditions = { eventId };
    if (status) {
      whereConditions.status = status;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get tickets with pagination
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    logger.info(`Retrieved ${tickets.length} tickets for event ${eventId}`);

    res.status(StatusCodes.OK).json({
      tickets,
      totalTickets: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Error retrieving event tickets: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving event tickets',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Cancel a ticket
exports.cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Find the ticket
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to cancel the ticket
    if (ticket.userId !== userId && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Check if ticket can be cancelled
    if (ticket.status !== 'purchased' && ticket.status !== 'reserved') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Ticket cannot be cancelled (status: ${ticket.status})`
      });
    }

    // Find ticket inventory
    const inventory = await TicketInventory.findOne({
      where: { id: ticket.inventoryId }
    });

    if (!inventory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Ticket inventory not found'
      });
    }

    // Update ticket
    await ticket.update({
      status: 'cancelled'
    });

    // Update inventory
    if (ticket.status === 'purchased') {
      await inventory.update({
        soldTickets: inventory.soldTickets - 1,
        cancelledTickets: inventory.cancelledTickets + 1
      });
    } else if (ticket.status === 'reserved') {
      await inventory.update({
        reservedTickets: inventory.reservedTickets - 1,
        cancelledTickets: inventory.cancelledTickets + 1
      });
    }

    // Create transaction record
    const transaction = await TicketTransaction.create({
      ticketId: ticket.id,
      userId,
      type: 'cancellation',
      amount: ticket.price,
      currency: ticket.currency,
      status: 'completed',
      metadata: {
        reason: 'User cancelled',
        cancelledBy: userId
      }
    });

    // Publish message to RabbitMQ
    await publishToQueue('ticket_cancelled', {
      ticketId: ticket.id,
      userId,
      eventId: ticket.eventId,
      price: ticket.price,
      currency: ticket.currency
    });

    // Send notification to user
    await publishToQueue('notification_event', {
      type: 'ticket_cancelled',
      userId,
      eventId: ticket.eventId,
      ticketId: ticket.id,
      message: `Your ticket has been cancelled successfully.`
    });

    logger.info(`Ticket ${ticket.id} cancelled by user ${userId}`);

    res.status(StatusCodes.OK).json({
      message: 'Ticket cancelled successfully',
      ticket: {
        id: ticket.id,
        status: 'cancelled'
      },
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        transactionDate: transaction.transactionDate
      }
    });
  } catch (error) {
    logger.error(`Error cancelling ticket: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error cancelling ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

