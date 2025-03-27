const amqp = require('amqplib');
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
    new winston.transports.File({ filename: 'rabbitmq.log' })
  ]
});

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    logger.info(`Attempting to connect to RabbitMQ at ${rabbitmqUrl}`);
    
    // Add a delay to ensure RabbitMQ is fully started
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const connection = await amqp.connect(rabbitmqUrl);
    
    // Create a channel
    channel = await connection.createChannel();
    
    // Ensure queues exist
    await channel.assertQueue('event_created', { durable: true });
    await channel.assertQueue('event_updated', { durable: true });
    await channel.assertQueue('event_cancelled', { durable: true });
    await channel.assertQueue('ticket_reserved', { durable: true });
    await channel.assertQueue('ticket_purchased', { durable: true });
    await channel.assertQueue('ticket_cancelled', { durable: true });
    await channel.assertQueue('notification_event', { durable: true });
    
    logger.info('Connected to RabbitMQ successfully');
    
    // Handle connection close
    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return channel;
  } catch (error) {
    logger.error(`Error connecting to RabbitMQ: ${error.message}`);
    channel = null;
    
    // Retry connection after a delay
    return new Promise(resolve => {
      setTimeout(async () => {
        const result = await connectRabbitMQ();
        resolve(result);
      }, 5000);
    });
  }
};

// Publish message to queue
const publishToQueue = async (queueName, message) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not available');
      return false;
    }
    
    await channel.assertQueue(queueName, { durable: true });
    const success = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
    
    logger.info(`Message published to queue ${queueName}`);
    return success;
  } catch (error) {
    logger.error(`Error publishing to queue ${queueName}: ${error.message}`);
    return false;
  }
};

// Consume messages from queue
const consumeFromQueue = async (queueName, callback) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not available');
      return false;
    }
    
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, (message) => {
      if (message) {
        const content = JSON.parse(message.content.toString());
        callback(content);
        channel.ack(message);
      }
    });
    
    logger.info(`Consumer registered for queue ${queueName}`);
    return true;
  } catch (error) {
    logger.error(`Error consuming from queue ${queueName}: ${error.message}`);
    return false;
  }
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  consumeFromQueue
};

