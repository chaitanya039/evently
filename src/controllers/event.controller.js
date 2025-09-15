import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { invalidateNamespace } from "../utils/cache.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validator.js";

const { Event } = db;

const createEvent = async (req, res, next) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, "Validation failed", parsed.error.errors);

    const newEvent = await Event.create({
      ...parsed.data,
      created_by: req.user?.id,
    });

    // Invalidate caches for user and event bookings
    await invalidateNamespace("events");

    return res
      .status(201)
      .json(new ApiResponse(201, newEvent, "Event created successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, title, location, date } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (title) where.title = { [db.Sequelize.Op.iLike]: `%${title}%` };
    if (location) where.location = { [db.Sequelize.Op.iLike]: `%${location}%` };
    if (date) where.date = date;

    const { rows: events, count } = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["date", "ASC"]],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          events,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
        "All events fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");
    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, "Validation failed", parsed.error.errors);

    const event = await Event.findByPk(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    await event.update(parsed.data);

    // Invalidate caches for user and event bookings
    await invalidateNamespace("events");

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    await event.destroy();

    // Invalidate caches for user and event bookings
    await invalidateNamespace("events");

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Event deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
