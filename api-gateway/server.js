const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
const { StatusCodes } = require('http-status-codes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');
require('dotenv').config();

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

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  logger.info(`Request params: ${JSON.stringify(req.params)}`);
  logger.info(`Request query: ${JSON.stringify(req.query)}`);
  next();
});

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3003';
const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3004';
const ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://ticket-service:3005';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ton-Ticket API',
      version: '1.0.0',
      description: 'API documentation for Ton-Ticket system'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'UP' });
});

app.use('/api/auth', proxy(authServiceUrl, {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    logger.info(`Proxying request: /api/auth${path} -> /api/auth${path}`);
    return `/api/auth${path}`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to auth service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Auth service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Auth service unavailable' });
  }
}));

app.use('/api/users', proxy(userServiceUrl, {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    logger.info(`Proxying request: /api/users${path} -> /api/users${path}`);
    return `/api/users${path}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`User service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'User service unavailable' });
  }
}));

app.use('/api/events', proxy(eventServiceUrl, {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    logger.info(`Proxying request: /api/events${path} -> /api/events${path}`);
    return `/api/events${path}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Event service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Event service unavailable' });
  }
}));

app.use('/api/venues', proxy(eventServiceUrl, {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    logger.info(`Proxying request: /api/venues${path} -> /api/venues${path}`);
    return `/api/venues${path}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Venue service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Venue service unavailable' });
  }
}));

app.use('/api/tickets', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    logger.info(`Proxying request: /api/tickets${path} -> /api${path}`);
    return `/api${path}`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use('/api/tickets/my', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    logger.info(`Proxying request: /api/tickets/my -> ${ticketServiceUrl}/api/my/tickets`);
    return '/api/my/tickets';
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use('/api/my/tickets', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    logger.info(`Proxying request: /api/my/tickets -> /api/my/tickets`);
    return `/api/my/tickets`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use('/api/tickets/user', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    logger.info(`Proxying request: /api/tickets/user -> /api/my/tickets`);
    return `/api/my/tickets`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use('/api/events/:eventId/tickets', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    const eventId = req.params.eventId;
    const path = req.url.replace('/api/events/' + eventId + '/tickets', '');
    const targetPath = `/api/events/${eventId}/tickets${path}`;
    logger.info(`Proxying request: /api/events/${eventId}/tickets${path} -> ${targetPath}`);
    return targetPath;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use('/events/:eventId/tickets', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    const eventId = req.params.eventId;
    const path = req.url.replace('/events/' + eventId + '/tickets', '');
    const targetPath = `/api/events/${eventId}/tickets${path}`;
    logger.info(`Proxying request: /events/${eventId}/tickets${path} -> ${targetPath}`);
    return targetPath;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.post('/api/events/:eventId/tickets/reserve', (req, res, next) => {
  const eventId = req.params.eventId;
  logger.info(`Handling ticket reservation for event ${eventId}`);
  
  const request = require('request');
  const ticketServiceEndpoint = `${ticketServiceUrl}/api/events/${eventId}/tickets/reserve`;
  
  logger.info(`Forwarding reservation request to: ${ticketServiceEndpoint}`);
  
  request({
    url: ticketServiceEndpoint,
    method: 'POST',
    json: true,
    body: req.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization
    }
  }, (error, response, body) => {
    if (error) {
      logger.error(`Error forwarding reservation request: ${error.message}`);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
    }
    
    logger.info(`Reservation response status: ${response.statusCode}`);
    res.status(response.statusCode).json(body);
  });
});

app.use('/auth', proxy(authServiceUrl, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to auth service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Auth service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Auth service unavailable' });
  }
}));

app.use('/users', proxy(userServiceUrl, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`User service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'User service unavailable' });
  }
}));

app.use('/events', proxy(eventServiceUrl, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Event service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Event service unavailable' });
  }
}));

app.use('/venues', proxy(eventServiceUrl, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Venue service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Venue service unavailable' });
  }
}));

app.use('/tickets', proxy(ticketServiceUrl, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
      logger.info('Authorization header forwarded to ticket service');
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Ticket service proxy error: ${err.message}`);
    res.status(StatusCodes.BAD_GATEWAY).json({ error: 'Ticket service unavailable' });
  }
}));

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
