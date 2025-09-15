import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { invalidateNamespace } from "../utils/cache.js";

const { User } = db;

// 📥 GET All Users (with pagination and filtering)
const getAllUsers = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;
  
  console.log("yess I am here");

  const whereClause = search
    ? {
        name: { [db.Sequelize.Op.iLike]: `%${search}%` },
      }
    : {};

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ["password_hash"] },
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json(
    new ApiResponse(200, {
      totalUsers: count,
      page: Number(page),
      limit: Number(limit),
      users,
    })
  );
});

// 📄 GET Single User by ID
const getUserById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("I am in by Id");

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password_hash"] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user));
});

// 📝 UPDATE User by ID
const updateUserById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      throw new ApiError(409, "Email already in use by another user");
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;

  await user.save();
  
  // Clear the cache after update where cache key starts with users prefix
  await invalidateNamespace("users");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

// ❌ DELETE User by ID
const deleteUserById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.destroy();
  
   // Clear the cache after update where cache key starts with users prefix
  await invalidateNamespace("users");
  
  res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};