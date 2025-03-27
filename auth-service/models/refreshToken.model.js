module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define('refreshToken', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false
    },
    expiryDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false
    }
  });

  // Instance method to check if token is expired
  RefreshToken.prototype.isExpired = function() {
    return new Date() > this.expiryDate;
  };

  return RefreshToken;
};

