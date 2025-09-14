// server.js

import dotenv from "dotenv";
dotenv.config(); // Ensure environment variables are loaded

import app from "./app.js";
import db from "./models/index.js";
import config from "./config/index.js";
import redis from "./utils/redis.js";

// Import BookingQueue Worker to initialize job processing
import "./queues/booking.queue.js";

const startServer = async () => {
  try {
    // ✅ Test Redis connection
    const pong = await redis.ping();
    console.log(`📦 Redis connected: ${pong}`); // should print "PONG"

    // ✅ Test DB connection
    await db.sequelize.authenticate();
    console.log(`✅ Database connection established on port ${config.DB.PORT}`);

    // ✅ Sync Sequelize models
    await db.sequelize.sync({ alter: true }); // { force: true } in dev to reset tables
    console.log("✅ All tables synced successfully!");

    // ✅ Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // Optional: Graceful shutdown for Redis or DB
    process.on("SIGINT", async () => {
      console.log("🔻 Shutting down gracefully...");
      await redis.quit();
      await db.sequelize.close();
      process.exit(0);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();