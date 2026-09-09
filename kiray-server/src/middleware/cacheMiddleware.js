import cacheService, { hashQuery } from "../services/cacheService.js";
import { isRedisReady } from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Express middleware to cache GET endpoint responses in Redis.
 *
 * @param {string} prefix - Namespace prefix for Redis keys (e.g. 'listings:query', 'comments:listing')
 * @param {number} ttlSeconds - Time-To-Live in seconds
 * @param {Function} [customKeyGenerator] - Optional custom function (req) => string
 */
export const cacheResponse = (prefix, ttlSeconds = 60, customKeyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Bypass cache if Redis is offline or client explicitly requests bypass
    if (!isRedisReady() || req.headers["cache-control"] === "no-cache") {
      res.setHeader("X-Cache", "BYPASS");
      return next();
    }

    // Determine cache key
    let cacheKey;
    try {
      if (typeof customKeyGenerator === "function") {
        cacheKey = customKeyGenerator(req);
      } else {
        const queryHash = hashQuery(req.query);
        const resourceId = req.params.idOrSlug || req.params.id || req.params.listingId;
        cacheKey = resourceId
          ? `${prefix}:${resourceId}:${queryHash}`
          : `${prefix}:${queryHash}`;
      }
    } catch (err) {
      logger.warn({ err: err.message }, "Error generating cache key, skipping cache");
      res.setHeader("X-Cache", "BYPASS");
      return next();
    }

    try {
      // 1. Check Redis for cached response
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData !== null && cachedData !== undefined) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cachedData);
      }

      // 2. Cache Miss: Intercept res.json to store the response upon completion
      res.setHeader("X-Cache", "MISS");

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful 2xx responses
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          // Asynchronously write to Redis without delaying the HTTP response
          cacheService.set(cacheKey, body, ttlSeconds).catch((err) => {
            logger.warn({ cacheKey, err: err.message }, "Background cache write failed");
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.warn({ cacheKey, err: error.message }, "Cache middleware error; bypassing cache");
      res.setHeader("X-Cache", "BYPASS");
      next();
    }
  };
};

export default cacheResponse;
