module.exports = (sequelize, Sequelize) => {
  const Address = sequelize.define('address', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('billing', 'shipping', 'both'),
      defaultValue: 'both'
    },
    street: {
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
    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

  return Address;
};

