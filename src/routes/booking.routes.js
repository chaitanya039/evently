// src/routes/booking.routes.js
import express from "express";
import { cache } from "../middlewares/cache.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBooking, getUserBookings, cancelBooking } from "../controllers/booking.controller.js";

const router = express.Router();

// Protected routes
router.use(verifyJWT);

// Create booking
router.post("/", createBooking);

// Get all bookings for current user (with cache)
router.get("/", cache("bookings"), getUserBookings);

// Cancel booking
router.patch("/:id/cancel", cancelBooking);

export default router;