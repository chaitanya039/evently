// controllers/booking.controller.js

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import redis from "../utils/redis.js";
import BookingQueue from "../queues/booking.queue.js";
import db from "../models/index.js";
import { invalidateNamespace } from "../utils/cache.js";
const { Booking, Event, WaitListEntry } = db;

export const createBooking = AsyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { event_id } = req.body;

  const event = await Event.findByPk(event_id);
  if (!event) throw new ApiError(404, "Event not found");

  // Count current confirmed bookings
  const confirmedCount = await Booking.count({
    where: { event_id, status: "confirmed" },
  });

  let booking;

  if (confirmedCount < event.capacity) {
    booking = await Booking.create({
      user_id,
      event_id,
      booked_at: new Date(),
      status: "confirmed",
    });

    // Add background job (e.g., send confirmation email)
    await BookingQueue.add("booking-confirmed", { user_id, event_id, bookingId: booking.id });

  } else {
    // Add to waitlist
    await WaitListEntry.create({
      user_id,
      event_id,
      joined_at: new Date(),
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Event full. Added to waitlist.")
    );
  }

  // Invalidate caches for user and event bookings
  await invalidateNamespace("bookings");
  await invalidateNamespace("events");

  return res.status(201).json(
    new ApiResponse(201, booking, "Booking confirmed")
  );
});

export const getUserBookings = AsyncHandler(async (req, res) => {
  const user_id = req.user.id;
  
  const bookings = await Booking.findAll({
    where: { user_id },
    include: [{ model: Event, as: "event", attributes: ["title", "date", "location"] }],
    order: [["booked_at", "DESC"]],
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "User bookings fetched"));
});

export const cancelBooking = AsyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ where: { id: bookingId, user_id } });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status === "cancelled")
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Booking already cancelled"));

  booking.status = "cancelled";
  await booking.save();

  // Invalidate caches for user and event bookings
  await invalidateNamespace("bookings");
  await invalidateNamespace("events");

  // Optional: Notify waitlist here (handled in job)
  await BookingQueue.add("booking-cancelled", {
    event_id: booking.event_id,
    cancelledBookingId: booking.id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled"));
});