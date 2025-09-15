// src/middlewares/cache.middleware.js
import redis from "../utils/redis.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const cache = (prefix = "") =>
  AsyncHandler(async (req, res, next) => {
    const cacheKey = `${prefix}:${req.originalUrl}`;

    try {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log("📦 Cache hit:", cacheKey);

        return res
          .status(200)
          .json({ ...JSON.parse(cachedData), source: "Cache hit" });
      }

      // Override res.json to store data in Redis before sending response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redis
          .setex(cacheKey, 3600, JSON.stringify(body)) // TTL = 1 hour
          .catch((err) =>
            console.error("❌ Failed to set cache in Redis:", err)
          );

        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("❌ Redis error:", err);
      throw new ApiError(500, "Redis caching error");
    }
  });
