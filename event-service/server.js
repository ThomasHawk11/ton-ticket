const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const winston = require('winston');
require('dotenv').config();

const db = require('./models');

const { connectRabbitMQ } = require('./utils/rabbitmq');

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

const eventRoutes = require('./routes/event.routes');
const venueRoutes = require('./routes/venue.routes');

app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);

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

const PORT = process.env.PORT || 3004;

const initApp = async () => {
  try {
    await db.sequelize.sync();
    logger.info('Database connected successfully');
    
    await connectRabbitMQ();
    logger.info('RabbitMQ connected successfully');
    
    app.listen(PORT, () => {
      logger.info(`Event service running on port ${PORT}`);
      console.log(`Event service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize app: ${error.message}`);
    process.exit(1);
  }
};

initApp();

module.exports = app;

