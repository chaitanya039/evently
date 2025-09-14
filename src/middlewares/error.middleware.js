// middlewares/error.middleware.js

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Not Found Handler
const notFound = (req, res, next) => {
  res.status(404).json(
    new ApiResponse(404, null, `Route ${req.originalUrl} not found`)
  );
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
    console.log(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(", ");
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = err.errors.map(e => e.message).join(", ");
  }

  // Sequelize Database Error
  if (err.name === "SequelizeDatabaseError") {
    statusCode = 500;
    message = "Database error: " + err.message;
  }

  // JWT token error handling (in case not caught earlier)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please login again.";
  }

  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message)
  );
};

export { notFound, globalErrorHandler };