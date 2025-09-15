// models/waitlist.model.js
import { DataTypes } from "sequelize";

const WaitlistEntryModel = (sequelize) => {
  const WaitlistEntry = sequelize.define(
    "WaitlistEntry",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("waiting", "notified", "booked", "skipped"),
        defaultValue: "waiting",
      },
    },
    {
      tableName: "waitlist_entries",
      timestamps: true,
    }
  );

  WaitlistEntry.associate = (models) => {
    WaitlistEntry.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    WaitlistEntry.belongsTo(models.Event, { foreignKey: "event_id", as: "event" });
  };

  return WaitlistEntry;
};

export default WaitlistEntryModel;
