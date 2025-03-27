const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const winston = require('winston');
require('dotenv').config();

const db = require('./models');

const { connectRabbitMQ, consumeFromQueue } = require('./utils/rabbitmq');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'UP' });
});

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

const PORT = process.env.PORT || 3003;

const initApp = async () => {
  try {
    await db.sequelize.sync();
    logger.info('Database connected successfully');
    
    const channel = await connectRabbitMQ();
    logger.info('RabbitMQ connected successfully');
    
    await consumeFromQueue('user_created', async (data) => {
      try {
        logger.info(`Received user_created event for user: ${data.id}`);
        await db.userProfile.create({
          userId: data.id,
          email: data.email,
          username: data.username
        });
        logger.info(`Created user profile for user: ${data.id}`);
      } catch (error) {
        logger.error(`Error processing user_created event: ${error.message}`);
      }
    });
    
    app.listen(PORT, () => {
      logger.info(`User service running on port ${PORT}`);
      console.log(`User service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize app: ${error.message}`);
    process.exit(1);
  }
};

initApp();

module.exports = app;

