module.exports = (sequelize, Sequelize) => {
  const UserProfile = sequelize.define('userProfile', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    phoneNumber: {
      type: Sequelize.STRING
    },
    birthDate: {
      type: Sequelize.DATEONLY
    },
    profilePicture: {
      type: Sequelize.STRING
    },
    preferences: {
      type: Sequelize.JSON,
      defaultValue: {}
    }
  });

  return UserProfile;
};

