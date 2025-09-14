import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

// 🔐 Middleware to Verify JWT from Header or Cookie
const verifyJWT = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Please login to access services!");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findByPk(decodedToken?.id, {
      attributes: { exclude: ["password_hash"] },
    });
    
    if (!user) {
      throw new ApiError(401, "Invalid token, please login again!");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Session expired. Please login again!"));
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Invalid token. Please login again!"));
    } else {
      return next(error); // Pass unhandled errors to global error handler
    }
  }
});

// 🔒 Role-based access control
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }
    next();
  };
};


export { verifyJWT, authorizeRoles };