import crypto from "crypto";
import { getRedisClient, isRedisReady } from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Serialize and generate a deterministic SHA-256 hash from a query object.
 * Query keys are sorted alphabetically so that { city: 'Algiers', page: 1 }
 * and { page: 1, city: 'Algiers' } produce the exact same cache key.
 */
export const hashQuery = (query = {}) => {
  if (!query || Object.keys(query).length === 0) {
    return "default";
  }
  const sortedEntries = Object.entries(query)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const queryString = JSON.stringify(sortedEntries);
  return crypto.createHash("sha256").update(queryString).digest("hex").slice(0, 16);
};

/**
 * Retrieve a parsed JSON value from Redis by key.
 * Returns null if the key does not exist or Redis is offline/erroring.
 */
export const get = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.warn({ key, err: error.message }, "Redis get failed; falling back to DB");
    return null;
  }
};

/**
 * Store a JSON-serializable value into Redis with a Time-To-Live (TTL in seconds).
 */
export const set = async (key, value, ttlSeconds = 60) => {
  if (!isRedisReady()) return false;
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds && Number(ttlSeconds) > 0) {
      await client.set(key, serialized, "EX", Number(ttlSeconds));
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    logger.warn({ key, err: error.message }, "Redis set failed");
    return false;
  }
};

/**
 * Delete one or more specific keys from Redis.
 */
export const del = async (...keys) => {
  if (!isRedisReady() || keys.length === 0) return 0;
  try {
    const client = getRedisClient();
    const flattened = keys.flat().filter(Boolean);
    if (flattened.length === 0) return 0;
    return await client.del(...flattened);
  } catch (error) {
    logger.warn({ keys, err: error.message }, "Redis del failed");
    return 0;
  }
};

/**
 * Safely delete all keys matching a wildcard pattern (e.g. 'listings:*', 'comments:listing:123:*').
 * Uses non-blocking SCAN iteration instead of the blocking KEYS command.
 */
export const delByPattern = async (pattern) => {
  if (!isRedisReady() || !pattern) return 0;
  try {
    const client = getRedisClient();
    let totalDeleted = 0;

    // Use ioredis scanStream for safe, chunked non-blocking cursor iteration
    if (typeof client.scanStream === "function") {
      const stream = client.scanStream({
        match: pattern,
        count: 100,
      });

      for await (const keys of stream) {
        if (keys && keys.length > 0) {
          const count = await client.del(...keys);
          totalDeleted += count;
        }
      }
      return totalDeleted;
    }

    // Fallback for ioredis-mock or environments without scanStream
    if (typeof client.keys === "function") {
      const matchingKeys = await client.keys(pattern);
      if (matchingKeys.length > 0) {
        totalDeleted = await client.del(...matchingKeys);
      }
    }
    return totalDeleted;
  } catch (error) {
    logger.warn({ pattern, err: error.message }, "Redis delByPattern failed");
    return 0;
  }
};

export default {
  hashQuery,
  get,
  set,
  del,
  delByPattern,
};
