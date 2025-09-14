import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", cache("events"), getAllEvents);        // GET /api/v1/events
router.get("/:id", cache("events"), getEventById);     // GET /api/v1/events/:id

// Admin-only Routes (Protected)
router.use(verifyJWT, authorizeRoles("admin"));

router.post("/", createEvent);        // POST /api/v1/events
router.put("/:id", updateEvent);      // PUT /api/v1/events/:id
router.delete("/:id", deleteEvent);   // DELETE /api/v1/events/:id

export default router;