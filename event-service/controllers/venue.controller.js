const { StatusCodes } = require('http-status-codes');
const db = require('../models');
const Venue = db.venue;
const Event = db.event;
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
    new winston.transports.File({ filename: 'venue.log' })
  ]
});

// Create a new venue
exports.createVenue = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      capacity,
      description,
      contactEmail,
      contactPhone,
      website,
      latitude,
      longitude,
      amenities,
      images
    } = req.body;

    // Create venue
    const venue = await Venue.create({
      name,
      address,
      city,
      state,
      postalCode,
      country,
      capacity,
      description,
      contactEmail,
      contactPhone,
      website,
      latitude,
      longitude,
      amenities: amenities || [],
      images: images || []
    });

    logger.info(`Venue created: ${venue.id}`);

    res.status(StatusCodes.CREATED).json({
      message: 'Venue created successfully',
      venue
    });
  } catch (error) {
    logger.error(`Error creating venue: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating venue',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Get all venues with pagination
exports.getAllVenues = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, country, search } = req.query;
    const offset = (page - 1) * limit;

    // Build filter conditions
    const whereConditions = {};
    
    if (city) {
      whereConditions.city = city;
    }
    
    if (country) {
      whereConditions.country = country;
    }
    
    if (search) {
      whereConditions[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.like]: `%${search}%` } },
        { address: { [db.Sequelize.Op.like]: `%${search}%` } },
        { city: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Get venues with pagination
    const { count, rows: venues } = await Venue.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']]
    });

    logger.info(`Retrieved ${venues.length} venues`);

    res.status(StatusCodes.OK).json({
      venues,
      totalVenues: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Error retrieving venues: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving venues',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Get venue by ID
exports.getVenueById = async (req, res) => {
  try {
    const venueId = req.params.id;

    const venue = await Venue.findByPk(venueId);

    if (!venue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Venue not found'
      });
    }

    logger.info(`Retrieved venue: ${venueId}`);

    res.status(StatusCodes.OK).json({
      venue
    });
  } catch (error) {
    logger.error(`Error retrieving venue: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving venue',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Update venue
exports.updateVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    const {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      capacity,
      description,
      contactEmail,
      contactPhone,
      website,
      latitude,
      longitude,
      amenities,
      images
    } = req.body;

    const venue = await Venue.findByPk(venueId);

    if (!venue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Venue not found'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Update venue
    await venue.update({
      name: name || venue.name,
      address: address || venue.address,
      city: city || venue.city,
      state: state || venue.state,
      postalCode: postalCode || venue.postalCode,
      country: country || venue.country,
      capacity: capacity || venue.capacity,
      description: description || venue.description,
      contactEmail: contactEmail || venue.contactEmail,
      contactPhone: contactPhone || venue.contactPhone,
      website: website || venue.website,
      latitude: latitude || venue.latitude,
      longitude: longitude || venue.longitude,
      amenities: amenities || venue.amenities,
      images: images || venue.images
    });

    logger.info(`Venue updated: ${venueId}`);

    res.status(StatusCodes.OK).json({
      message: 'Venue updated successfully',
      venue
    });
  } catch (error) {
    logger.error(`Error updating venue: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating venue',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Delete venue
exports.deleteVenue = async (req, res) => {
  try {
    const venueId = req.params.id;

    const venue = await Venue.findByPk(venueId);

    if (!venue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Venue not found'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Access denied'
      });
    }

    // Check if venue is associated with any events
    const events = await Event.findAll({
      where: {
        venueId
      }
    });

    if (events.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Cannot delete venue as it is associated with events'
      });
    }

    // Delete venue
    await venue.destroy();

    logger.info(`Venue deleted: ${venueId}`);

    res.status(StatusCodes.OK).json({
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting venue: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting venue',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Get events by venue
exports.getEventsByVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Check if venue exists
    const venue = await Venue.findByPk(venueId);

    if (!venue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Venue not found'
      });
    }

    // Build filter conditions
    const whereConditions = {
      venueId
    };
    
    if (status) {
      whereConditions.status = status;
    } else {
      // Default to published events for non-admin users
      if (req.user.role !== 'admin') {
        whereConditions.status = 'published';
        whereConditions.isPublic = true;
      }
    }

    // Get events with pagination
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.eventCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['startDate', 'ASC']]
    });

    logger.info(`Retrieved ${events.length} events for venue: ${venueId}`);

    res.status(StatusCodes.OK).json({
      events,
      totalEvents: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      venue: {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        country: venue.country
      }
    });
  } catch (error) {
    logger.error(`Error retrieving venue events: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving venue events',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

