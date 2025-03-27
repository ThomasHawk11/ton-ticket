module.exports = (sequelize, Sequelize) => {
  const Venue = sequelize.define('venue', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    state: {
      type: Sequelize.STRING
    },
    postalCode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    contactEmail: {
      type: Sequelize.STRING
    },
    contactPhone: {
      type: Sequelize.STRING
    },
    website: {
      type: Sequelize.STRING
    },
    latitude: {
      type: Sequelize.FLOAT
    },
    longitude: {
      type: Sequelize.FLOAT
    },
    amenities: {
      type: Sequelize.JSON
    },
    images: {
      type: Sequelize.JSON
    }
  });

  return Venue;
};

