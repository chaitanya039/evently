import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const { User } = db;

// Email and password validators
const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isPasswordStrong = (password) =>
  password.length >= 6 && /\d/.test(password) && /[A-Za-z]/.test(password);

// 🔐 Register
const registerUser = AsyncHandler(async (req, res) => {
  const { name = "", email = "", password = "", role = "user" } = req.body;

  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new ApiError(400, "Name, Email, and Password are required.");
  }

  if (!isEmailValid(email)) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  if (!isPasswordStrong(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long and contain both letters and numbers."
    );
  }

  // Validate role
  const allowedRoles = ["user", "admin"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(
      409,
      "This email is already registered. Please try logging in."
    );
  }

  // Create user (password will be hashed automatically via model hook)
  const user = await User.create({ name, email, password_hash: password, role: userRole });
  const token = await user.generateAccessToken();

  // Set token in cookie
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json(
    new ApiResponse(
      201,
      { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
      "Account created successfully."
    )
  );
});

// 🔐 Login
const loginUser = AsyncHandler(async (req, res) => {
  const { email = "", password = "" } = req.body;

  if (!email.trim() || !password.trim()) {
    throw new ApiError(400, "Email and Password are required.");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = await user.generateAccessToken();

  // Set token in cookie
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
      "Login successful."
    )
  );
});

// 🔓 Logout
const logoutUser = AsyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(200).json(
    new ApiResponse(200, {}, "Logout successful. Session has been terminated.")
  );
});

// 👤 Get Logged-In User Profile
const getMyProfile = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { id: user.id, name: user.name, email: user.email, role: user.role },
      "User profile retrieved successfully."
    )
  );
});

export { registerUser, loginUser, logoutUser, getMyProfile };