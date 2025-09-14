// server.js
import app from "./app.js";
import db from "./models/index.js";
import config from "./config/index.js";

const startServer = async () => {
  try {
    // Test DB connection
    await db.sequelize.authenticate();
    console.log(`✅ Database connection established on port ${config.DB.PORT}`);

    // Sync models to create tables if they don't exist
    await db.sequelize.sync({ alter: true }); // use { force: true } in dev if you want to drop & recreate
    console.log("✅ All tables synced successfully!");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect or sync the database:", err);
    process.exit(1);
  }
};

startServer();