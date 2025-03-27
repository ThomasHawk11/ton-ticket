module.exports = (sequelize, Sequelize) => {
  const Event = sequelize.define('event', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    organizerId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    venueId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    categoryId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('draft', 'published', 'cancelled'),
      defaultValue: 'draft'
    },
    featuredImage: {
      type: Sequelize.STRING
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ticketsAvailable: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ticketPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: 'EUR'
    },
    isPublic: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    tags: {
      type: Sequelize.JSON
    },
    metadata: {
      type: Sequelize.JSON
    }
  });

  return Event;
};

