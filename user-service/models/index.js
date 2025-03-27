const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'user_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'user-db',
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
db.userProfile = require('./userProfile.model')(sequelize, Sequelize);
db.address = require('./address.model')(sequelize, Sequelize);

// Define relationships
db.userProfile.hasMany(db.address, {
  foreignKey: 'userId',
  sourceKey: 'userId'
});
db.address.belongsTo(db.userProfile, {
  foreignKey: 'userId',
  targetKey: 'userId'
});

module.exports = db;

