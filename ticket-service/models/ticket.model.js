module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define('ticket', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    eventId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true // Null until purchased
    },
    inventoryId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('available', 'reserved', 'purchased', 'cancelled', 'used'),
      defaultValue: 'available'
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: 'EUR'
    },
    purchaseDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    qrCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    validationCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    seatInfo: {
      type: Sequelize.JSON,
      allowNull: true
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    }
  });

  return Ticket;
};

