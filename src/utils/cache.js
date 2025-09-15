// utils/cache.js
import redis from "./redis.js";

export const invalidateNamespace = async (prefix) => {
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Cache invalidated for namespace: ${prefix}`);
    }
  } catch (err) {
    console.error(`❌ Failed to invalidate ${prefix} namespace:`, err);
  }
};