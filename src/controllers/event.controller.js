import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const { Event } = db;

/**
 * @desc    Create a new event (Admin only)
 * @route   POST /api/v1/events
 * @access  Private (Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    // Validate incoming data using Zod
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.errors);
    }

    // Create event with current admin user as creator
    const newEvent = await Event.create({
      ...parsed.data,
      created_by: req.user?.id, // assuming JWT middleware adds req.user
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newEvent, "Event created successfully"));
  } catch (error) {
    next(error); // Passes error to global error handler
  }
};

/**
 * @desc    Get all events (Public or Admin)
 * @route   GET /api/v1/events
 * @access  Public
 */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll();
    return res
      .status(200)
      .json(new ApiResponse(200, events, "All events fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event by ID
 * @route   GET /api/v1/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event (Admin only)
 * @route   PUT /api/v1/events/:id
 * @access  Private (Admin)
 */
const updateEvent = async (req, res, next) => {
  try {
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.errors);
    }

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Update only the allowed fields
    await event.update(parsed.data);

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event (Admin only)
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Admin)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    await event.destroy();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Event deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};