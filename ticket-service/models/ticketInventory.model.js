module.exports = (sequelize, Sequelize) => {
  const TicketInventory = sequelize.define('ticketInventory', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    eventId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    totalTickets: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    availableTickets: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    reservedTickets: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    soldTickets: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    cancelledTickets: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    basePrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING,
      defaultValue: 'EUR'
    },
    saleStartDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    saleEndDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('draft', 'active', 'paused', 'sold_out', 'closed'),
      defaultValue: 'draft'
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    }
  });

  return TicketInventory;
};

