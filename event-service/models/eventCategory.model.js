module.exports = (sequelize, Sequelize) => {
  const EventCategory = sequelize.define('eventCategory', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT
    },
    icon: {
      type: Sequelize.STRING
    },
    color: {
      type: Sequelize.STRING
    }
  });

  return EventCategory;
};

