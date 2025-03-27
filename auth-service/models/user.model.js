module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('user', 'admin', 'organizer'),
      defaultValue: 'user'
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: Sequelize.DATE
    }
  });

  return User;
};

