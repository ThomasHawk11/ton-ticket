const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { validateRequest } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:userId/profile',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    validateRequest,
    verifyToken
  ],
  userController.getUserProfile
);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               profilePicture:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:userId/profile',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('firstName').optional().isString().withMessage('First name must be a string'),
    body('lastName').optional().isString().withMessage('Last name must be a string'),
    body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
    body('birthDate').optional().isDate().withMessage('Birth date must be a valid date'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
    validateRequest,
    verifyToken
  ],
  userController.updateUserProfile
);

/**
 * @swagger
 * /api/users/{userId}/addresses:
 *   post:
 *     summary: Add address to user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - postalCode
 *               - country
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [billing, shipping, both]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:userId/addresses',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('type').optional().isIn(['billing', 'shipping', 'both']).withMessage('Type must be billing, shipping, or both'),
    body('street').notEmpty().withMessage('Street is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('postalCode').notEmpty().withMessage('Postal code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
    validateRequest,
    verifyToken
  ],
  userController.addAddress
);

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [billing, shipping, both]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:userId/addresses/:addressId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    param('addressId').isUUID().withMessage('Invalid address ID'),
    body('type').optional().isIn(['billing', 'shipping', 'both']).withMessage('Type must be billing, shipping, or both'),
    body('street').optional().isString().withMessage('Street must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('postalCode').optional().isString().withMessage('Postal code must be a string'),
    body('country').optional().isString().withMessage('Country must be a string'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
    validateRequest,
    verifyToken
  ],
  userController.updateAddress
);

/**
 * @swagger
 * /api/users/{userId}/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:userId/addresses/:addressId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    param('addressId').isUUID().withMessage('Invalid address ID'),
    validateRequest,
    verifyToken
  ],
  userController.deleteAddress
);

module.exports = router;

