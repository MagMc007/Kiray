import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";
import logger from "./config/logger.js";
import { bootstrapAdminUser } from "./services/adminService.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (graceful fallback if offline)
    await connectRedis();

    // Create admin account if credentials are configured

    await bootstrapAdminUser();

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
