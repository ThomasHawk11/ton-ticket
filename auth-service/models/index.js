const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'auth_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'auth-db',
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
db.user = require('./user.model')(sequelize, Sequelize);
db.refreshToken = require('./refreshToken.model')(sequelize, Sequelize);

// Define relationships
db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId',
  targetKey: 'id'
});
db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId',
  sourceKey: 'id'
});

module.exports = db;

