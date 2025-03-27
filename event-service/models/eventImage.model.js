module.exports = (sequelize, Sequelize) => {
  const EventImage = sequelize.define('eventImage', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    eventId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false
    },
    caption: {
      type: Sequelize.STRING
    },
    sortOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return EventImage;
};

