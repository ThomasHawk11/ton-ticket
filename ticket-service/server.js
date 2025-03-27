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

const ticketRoutes = require('./routes/ticket.routes');
app.use('/api', ticketRoutes);

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

const PORT = process.env.PORT || 3005;

const initApp = async () => {
  try {
    await db.sequelize.sync();
    logger.info('Database connected successfully');
    const channel = await connectRabbitMQ();
    logger.info('RabbitMQ connected successfully');
    if (channel) {
      await consumeFromQueue('event_created', async (message) => {
        logger.info(`Received event_created message: ${JSON.stringify(message)}`);
        const ticketController = require('./controllers/ticket.controller');
        await ticketController.createTicketInventory(message);
      });
      await consumeFromQueue('event_updated', async (message) => {
        logger.info(`Received event_updated message: ${JSON.stringify(message)}`);
        const ticketController = require('./controllers/ticket.controller');
        await ticketController.updateTicketInventory(message);
      });
      await consumeFromQueue('event_cancelled', async (message) => {
        logger.info(`Received event_cancelled message: ${JSON.stringify(message)}`);
        const ticketController = require('./controllers/ticket.controller');
        await ticketController.cancelTickets(message);
      });
    }
    app.listen(PORT, () => {
      logger.info(`Ticket service running on port ${PORT}`);
      console.log(`Ticket service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize app: ${error.message}`);
    process.exit(1);
  }
};

initApp();
module.exports = app;

