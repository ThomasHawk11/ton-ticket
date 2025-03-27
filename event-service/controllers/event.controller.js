const { StatusCodes } = require('http-status-codes');
const db = require('../models');
const Event = db.event;
const Venue = db.venue;
const EventCategory = db.eventCategory;
const EventImage = db.eventImage;
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
    new winston.transports.File({ filename: 'event.log' })
  ]
});

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      venueId,
      categoryId,
      capacity,
      ticketsAvailable,
      ticketPrice,
      currency,
      isPublic,
      tags,
      featuredImage,
      metadata
    } = req.body;

    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Venue not found'
      });
    }

    const category = await EventCategory.findByPk(categoryId);
    if (!category) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Category not found'
      });
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      organizerId: req.user.id,
      venueId,
      categoryId,
      capacity,
      ticketsAvailable,
      ticketPrice,
      currency: currency || 'EUR',
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tags || [],
      featuredImage,
      metadata: metadata || {}
    });

    await publishToQueue('event_created', {
      id: event.id,
      title: event.title,
      organizerId: event.organizerId,
      startDate: event.startDate,
      venueId: event.venueId,
      ticketsAvailable: event.ticketsAvailable,
      ticketPrice: event.ticketPrice,
      currency: event.currency
    });

    logger.info(`Event created: ${event.id}`);

    res.status(StatusCodes.CREATED).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    logger.error(`Error creating event: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating event',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoryId, startDate, endDate, search } = req.query;
    const offset = (page - 1) * limit;

    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }
    
    if (startDate) {
      whereConditions.startDate = {
        [db.Sequelize.Op.gte]: new Date(startDate)
      };
    }
    
    if (endDate) {
      whereConditions.endDate = {
        [db.Sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    if (search) {
      whereConditions[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.like]: `%${search}%` } },
        { description: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'organizer') {
      whereConditions.isPublic = true;
      whereConditions.status = 'published';
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Venue,
          as: 'venue',
          attributes: ['id', 'name', 'city', 'country']
        },
        {
          model: EventCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['startDate', 'ASC']]
    });

    logger.info(`Retrieved ${events.length} events`);

    res.status(StatusCodes.OK).json({
      events,
      totalEvents: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Error retrieving events: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving events',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Venue,
          as: 'venue'
        },
        {
          model: EventCategory,
          as: 'category'
        },
        {
          model: EventImage,
          as: 'images'
        }
      ]
    });

    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (!event.isPublic && req.user && req.user.role !== 'admin' && req.user.id !== event.organizerId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    logger.info(`Retrieved event: ${eventId}`);

    res.status(StatusCodes.OK).json({
      event
    });
  } catch (error) {
    logger.error(`Error retrieving event: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving event',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      startDate,
      endDate,
      venueId,
      categoryId,
      status,
      capacity,
      ticketsAvailable,
      ticketPrice,
      currency,
      isPublic,
      tags,
      featuredImage,
      metadata
    } = req.body;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== event.organizerId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    if (venueId) {
      const venue = await Venue.findByPk(venueId);
      if (!venue) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Venue not found'
        });
      }
    }

    if (categoryId) {
      const category = await EventCategory.findByPk(categoryId);
      if (!category) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Category not found'
        });
      }
    }

    await event.update({
      title: title || event.title,
      description: description || event.description,
      startDate: startDate || event.startDate,
      endDate: endDate || event.endDate,
      venueId: venueId || event.venueId,
      categoryId: categoryId || event.categoryId,
      status: status || event.status,
      capacity: capacity || event.capacity,
      ticketsAvailable: ticketsAvailable !== undefined ? ticketsAvailable : event.ticketsAvailable,
      ticketPrice: ticketPrice || event.ticketPrice,
      currency: currency || event.currency,
      isPublic: isPublic !== undefined ? isPublic : event.isPublic,
      tags: tags || event.tags,
      featuredImage: featuredImage || event.featuredImage,
      metadata: metadata || event.metadata
    });

    await publishToQueue('event_updated', {
      id: event.id,
      title: event.title,
      organizerId: event.organizerId,
      startDate: event.startDate,
      venueId: event.venueId,
      ticketsAvailable: event.ticketsAvailable,
      ticketPrice: event.ticketPrice,
      currency: event.currency,
      status: event.status
    });

    logger.info(`Event updated: ${eventId}`);

    res.status(StatusCodes.OK).json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    logger.error(`Error updating event: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating event',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== event.organizerId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    await event.update({
      status: 'cancelled'
    });

    await publishToQueue('event_cancelled', {
      id: event.id,
      title: event.title,
      organizerId: event.organizerId,
      startDate: event.startDate
    });

    logger.info(`Event cancelled: ${eventId}`);

    res.status(StatusCodes.OK).json({
      message: 'Event cancelled successfully',
      event
    });
  } catch (error) {
    logger.error(`Error cancelling event: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error cancelling event',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.addEventImage = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { imageUrl, caption, sortOrder } = req.body;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== event.organizerId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    const eventImage = await EventImage.create({
      eventId,
      imageUrl,
      caption,
      sortOrder: sortOrder || 0
    });

    logger.info(`Image added to event: ${eventId}`);

    res.status(StatusCodes.CREATED).json({
      message: 'Image added to event successfully',
      eventImage
    });
  } catch (error) {
    logger.error(`Error adding image to event: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error adding image to event',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.getEventsByOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.organizerId;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereConditions = {
      organizerId
    };
    
    if (status) {
      whereConditions.status = status;
    }

    if (req.user.role !== 'admin' && req.user.id !== organizerId) {
      whereConditions.isPublic = true;
      whereConditions.status = 'published';
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Venue,
          as: 'venue',
          attributes: ['id', 'name', 'city', 'country']
        },
        {
          model: EventCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['startDate', 'ASC']]
    });

    logger.info(`Retrieved ${events.length} events for organizer: ${organizerId}`);

    res.status(StatusCodes.OK).json({
      events,
      totalEvents: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Error retrieving organizer events: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving organizer events',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        status: 'published',
        startDate: {
          [db.Sequelize.Op.gte]: new Date() 
        }
      },
      include: [
        {
          model: Venue,
          as: 'venue',
          attributes: ['id', 'name', 'address', 'city', 'postalCode']
        },
        {
          model: EventCategory,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: EventImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'caption'],
          limit: 1 
        }
      ],
      limit: 6, 
      order: [['startDate', 'ASC']] 
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      events
    });
  } catch (error) {
    logger.error(`Error fetching featured events: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch featured events',
      error: error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await EventCategory.findAll({
      attributes: ['id', 'name', 'description', 'icon', 'color'],
      order: [['name', 'ASC']]
    });

    logger.info(`Retrieved ${categories.length} event categories`);

    return res.status(StatusCodes.OK).json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error(`Error fetching event categories: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch event categories',
      error: error.message
    });
  }
};
