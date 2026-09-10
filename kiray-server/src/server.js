import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";
import logger from "./config/logger.js";
import { bootstrapAdminUser } from "./services/adminService.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import mongoose from "mongoose";

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
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        try {
          await disconnectRedis();
          await mongoose.connection.close();
          logger.info("Connections closed. Exiting process.");
          process.exit(0);
        } catch (err) {
          logger.error({ err }, "Error during graceful shutdown");
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
