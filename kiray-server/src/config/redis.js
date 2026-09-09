import Redis from "ioredis";
import RedisMock from "ioredis-mock";
import logger from "./logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const IS_TEST_ENV = process.env.NODE_ENV === "test";

let redisClient = null;
let isConnected = false;

/**
 * Initialize or return the singleton Redis client instance.
 * In test environment, uses ioredis-mock by default for isolation and no open handles.
 */
export const createRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  if (IS_TEST_ENV && !process.env.USE_REAL_REDIS) {
    redisClient = new RedisMock();
    isConnected = true;
    logger.debug("Redis: initialized in-memory mock for test environment");
    return redisClient;
  }

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // Do not buffer commands if Redis is disconnected; allow immediate fallback to DB
    lazyConnect: false, // Auto-connect in background
    retryStrategy(times) {
      if (times > 5) {
        logger.warn("Redis: max connection retries reached. Operating in bypass/fallback mode.");
        return null; // Stop reconnection loop when server is offline
      }
      return Math.min(times * 300, 2000);
    },
  });

  client.on("connect", () => {
    logger.info("Redis: socket connected");
  });

  client.on("ready", () => {
    isConnected = true;
    logger.info(`Redis client connected & ready at ${REDIS_URL}`);
  });

  client.on("error", (err) => {
    isConnected = false;
    // Log as warning rather than uncaught error to prevent application crash
    logger.warn({ err: err.message }, "Redis connection issue (cache bypass mode active)");
  });

  client.on("close", () => {
    isConnected = false;
    logger.warn("Redis connection closed");
  });

  client.on("reconnecting", (delay) => {
    logger.info(`Redis reconnecting in ${delay}ms...`);
  });

  redisClient = client;
  return redisClient;
};

/**
 * Retrieve the active Redis client instance (creating if not yet instantiated).
 */
export const getRedisClient = () => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

/**
 * Check if the Redis client is currently connected and ready to process commands.
 */
export const isRedisReady = () => {
  const client = getRedisClient();
  if (IS_TEST_ENV && !process.env.USE_REAL_REDIS) return true;
  return isConnected && client && client.status === "ready";
};

/**
 * Connect to Redis during server startup.
 * Gracefully catches connection failures so the application continues to boot.
 */
export const connectRedis = async () => {
  const client = getRedisClient();

  if (IS_TEST_ENV && !process.env.USE_REAL_REDIS) {
    return client;
  }

  try {
    if (client.status === "ready") {
      return client;
    }

    if (client.status === "wait" || client.status === "close") {
      await client.connect();
    }

    if (client.status !== "ready") {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(), 3000); // 3s safety timeout
        client.once("ready", () => {
          clearTimeout(timer);
          resolve();
        });
        client.once("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    }

    return client;
  } catch (error) {
    logger.warn(
      { err: error.message },
      "Could not establish Redis connection at startup. Server will operate with direct DB queries (cache bypass)."
    );
    return null;
  }
};

/**
 * Disconnect and cleanup the Redis client (useful for graceful shutdown and tests).
 */
export const disconnectRedis = async () => {
  if (redisClient) {
    try {
      if (typeof redisClient.quit === "function") {
        await redisClient.quit();
      }
    } catch {
      if (typeof redisClient.disconnect === "function") {
        redisClient.disconnect();
      }
    } finally {
      isConnected = false;
      redisClient = null;
    }
  }
};

export default getRedisClient;
