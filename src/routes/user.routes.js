import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

// 🔒 All routes here are protected and admin-only
router.use(verifyJWT, authorizeRoles("admin"));

// ✅ Cache-enabled routes
router.get("/", cache("users"), getAllUsers); // ?page=1&limit=10&search=John
router.get("/:id", cache("users"), getUserById);

// ❌ No cache for mutations (invalidate separately inside controller if needed)
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

export default router;