const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ticket_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'ticket-db',
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
db.ticket = require('./ticket.model')(sequelize, Sequelize);
db.ticketInventory = require('./ticketInventory.model')(sequelize, Sequelize);
db.ticketTransaction = require('./ticketTransaction.model')(sequelize, Sequelize);

// Define relationships
db.ticketInventory.hasMany(db.ticket, {
  foreignKey: 'inventoryId',
  as: 'tickets'
});

db.ticket.belongsTo(db.ticketInventory, {
  foreignKey: 'inventoryId',
  as: 'inventory'
});

db.ticket.hasMany(db.ticketTransaction, {
  foreignKey: 'ticketId',
  as: 'transactions'
});

db.ticketTransaction.belongsTo(db.ticket, {
  foreignKey: 'ticketId',
  as: 'ticket'
});

module.exports = db;

