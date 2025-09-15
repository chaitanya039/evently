// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import serverAdapter from "./utils/bullBoard.js";

import authRoutes from "./routes/auth.routes.js";
import {
  globalErrorHandler,
  notFound,
} from "./middlewares/error.middleware.js";
import userAdminRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Queue Visualization
app.use("/admin/queues", serverAdapter.getRouter());

// API routes with versioning
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin/users", userAdminRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", bookingRoutes);


// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
