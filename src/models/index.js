import { Sequelize } from "sequelize";
import config from "../config/index.js";

// Import your models
import UserModel from "./user.model.js";
import EventModel from "./event.model.js";
import BookingModel from "./booking.model.js";
import WaitlistEntryModel from "./waitlist.model.js";

// Initialize Sequelize
const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    logging: false,
  }
);

// Initialize models with DataTypes
const User = UserModel(sequelize);
const Event = EventModel(sequelize);
const Booking = BookingModel(sequelize);
const WaitlistEntry = WaitlistEntryModel(sequelize);

// Collect models + sequelize instance
const db = {
  sequelize,
  Sequelize,
  User,
  Event,
  Booking,
  WaitlistEntry
};

export default db;