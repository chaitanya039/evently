import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// @route   POST /auth/register
// @desc    Register new user
router.post("/register", registerUser);

// @route   POST /auth/login
// @desc    Login existing user
router.post("/login", loginUser);

// @route   POST /auth/logout
// @desc    Logout user
router.post("/logout", logoutUser);

// @route   GET /auth/me
// @desc    Get current user profile
router.get("/me", verifyJWT, getMyProfile);

export default router;