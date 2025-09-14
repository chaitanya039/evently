import { DataTypes } from "sequelize";

const Event = (sequelize) => {
  const EventModel = sequelize.define(
    "Event",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "events",
      timestamps: true,
      underscored: true,
    }
  );

  EventModel.associate = (models) => {
    EventModel.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return EventModel;
};

export default Event;
