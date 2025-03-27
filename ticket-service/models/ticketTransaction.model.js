module.exports = (sequelize, Sequelize) => {
  const TicketTransaction = sequelize.define('ticketTransaction', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    ticketId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('reservation', 'purchase', 'cancellation', 'refund', 'transfer', 'validation'),
      allowNull: false
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: 'EUR'
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: Sequelize.STRING,
      allowNull: true
    },
    paymentReference: {
      type: Sequelize.STRING,
      allowNull: true
    },
    transactionDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    }
  });

  return TicketTransaction;
};

