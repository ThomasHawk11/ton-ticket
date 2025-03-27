const { StatusCodes } = require('http-status-codes');
const db = require('../models');
const UserProfile = db.userProfile;
const Address = db.address;
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
    new winston.transports.File({ filename: 'user.log' })
  ]
});

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const userProfiles = await UserProfile.findAll({
      include: [
        {
          model: Address,
          as: 'addresses'
        }
      ]
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      users: userProfiles
    });
  } catch (error) {
    logger.error(`Error getting all users: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userProfile = await UserProfile.findOne({
      where: { userId },
      include: [
        {
          model: Address,
          as: 'addresses'
        }
      ]
    });
    
    if (!userProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User profile not found'
      });
    }
    
    logger.info(`Retrieved profile for user: ${userId}`);
    
    res.status(StatusCodes.OK).json({
      userProfile
    });
  } catch (error) {
    logger.error(`Error retrieving user profile: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { firstName, lastName, phoneNumber, birthDate, profilePicture, preferences } = req.body;
    
    const userProfile = await UserProfile.findOne({
      where: { userId }
    });
    
    if (!userProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User profile not found'
      });
    }
    
    // Update profile
    await userProfile.update({
      firstName: firstName || userProfile.firstName,
      lastName: lastName || userProfile.lastName,
      phoneNumber: phoneNumber || userProfile.phoneNumber,
      birthDate: birthDate || userProfile.birthDate,
      profilePicture: profilePicture || userProfile.profilePicture,
      preferences: preferences || userProfile.preferences
    });
    
    // Publish profile_updated event to RabbitMQ
    await publishToQueue('profile_updated', {
      userId,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      updatedAt: userProfile.updatedAt
    });
    
    logger.info(`Updated profile for user: ${userId}`);
    
    res.status(StatusCodes.OK).json({
      message: 'User profile updated successfully',
      userProfile
    });
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating user profile',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Add address to user profile
exports.addAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { type, street, city, state, postalCode, country, isDefault } = req.body;
    
    // Check if user profile exists
    const userProfile = await UserProfile.findOne({
      where: { userId }
    });
    
    if (!userProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User profile not found'
      });
    }
    
    // Create new address
    const address = await Address.create({
      userId,
      type,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    });
    
    // If this is the default address, update other addresses
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        {
          where: {
            userId,
            id: { [db.Sequelize.Op.ne]: address.id }
          }
        }
      );
    }
    
    logger.info(`Added address for user: ${userId}`);
    
    res.status(StatusCodes.CREATED).json({
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    logger.error(`Error adding address: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error adding address',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const { type, street, city, state, postalCode, country, isDefault } = req.body;
    
    // Find address
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId
      }
    });
    
    if (!address) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Address not found'
      });
    }
    
    // Update address
    await address.update({
      type: type || address.type,
      street: street || address.street,
      city: city || address.city,
      state: state || address.state,
      postalCode: postalCode || address.postalCode,
      country: country || address.country,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault
    });
    
    // If this is the default address, update other addresses
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        {
          where: {
            userId,
            id: { [db.Sequelize.Op.ne]: address.id }
          }
        }
      );
    }
    
    logger.info(`Updated address for user: ${userId}`);
    
    res.status(StatusCodes.OK).json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    logger.error(`Error updating address: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating address',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    
    // Find address
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId
      }
    });
    
    if (!address) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Address not found'
      });
    }
    
    // Delete address
    await address.destroy();
    
    logger.info(`Deleted address for user: ${userId}`);
    
    res.status(StatusCodes.OK).json({
      message: 'Address deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting address: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting address',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

