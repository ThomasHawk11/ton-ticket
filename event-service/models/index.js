const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'event_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'event-db',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.event = require('./event.model')(sequelize, Sequelize);
db.venue = require('./venue.model')(sequelize, Sequelize);
db.eventCategory = require('./eventCategory.model')(sequelize, Sequelize);
db.eventImage = require('./eventImage.model')(sequelize, Sequelize);

// Define relationships
db.event.belongsTo(db.venue, {
  foreignKey: 'venueId',
  as: 'venue'
});

db.venue.hasMany(db.event, {
  foreignKey: 'venueId',
  as: 'events'
});

db.event.belongsTo(db.eventCategory, {
  foreignKey: 'categoryId',
  as: 'category'
});

db.eventCategory.hasMany(db.event, {
  foreignKey: 'categoryId',
  as: 'events'
});

db.event.hasMany(db.eventImage, {
  foreignKey: 'eventId',
  as: 'images'
});

db.eventImage.belongsTo(db.event, {
  foreignKey: 'eventId',
  as: 'event'
});

module.exports = db;

