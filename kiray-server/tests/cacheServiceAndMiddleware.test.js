import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import express from "express";
import request from "supertest";
import cacheService, { hashQuery } from "../src/services/cacheService.js";
import cacheResponse from "../src/middleware/cacheMiddleware.js";
import { connectRedis, disconnectRedis } from "../src/config/redis.js";

describe("Phase 2: Cache Service & Middleware Tests", () => {
  beforeAll(async () => {
    if (process.env.USE_REAL_REDIS) {
      await connectRedis();
    }
  });

  afterAll(async () => {
    await disconnectRedis();
  });

  describe("hashQuery utility", () => {
    it("returns 'default' for empty or missing queries", () => {
      expect(hashQuery({})).toBe("default");
      expect(hashQuery(null)).toBe("default");
      expect(hashQuery(undefined)).toBe("default");
    });

    it("generates deterministic hashes regardless of parameter order", () => {
      const hash1 = hashQuery({ city: "Algiers", page: "1", sort: "price_asc" });
      const hash2 = hashQuery({ sort: "price_asc", page: "1", city: "Algiers" });
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(16);
    });

    it("filters out empty or undefined parameters", () => {
      const hash1 = hashQuery({ city: "Algiers", filter: "" });
      const hash2 = hashQuery({ city: "Algiers" });
      expect(hash1).toBe(hash2);
    });
  });

  describe("cacheService (CRUD & Invalidation)", () => {
    beforeEach(async () => {
      await cacheService.delByPattern("test:*");
    });

    it("sets and gets JSON-serializable values", async () => {
      const key = "test:item:1";
      const value = { id: 1, title: "Modern Apartment", tags: ["balcony", "wifi"] };

      const setSuccess = await cacheService.set(key, value, 60);
      expect(setSuccess).toBe(true);

      const retrieved = await cacheService.get(key);
      expect(retrieved).toEqual(value);
    });

    it("returns null for non-existent keys", async () => {
      const retrieved = await cacheService.get("test:does_not_exist");
      expect(retrieved).toBeNull();
    });

    it("deletes specific keys", async () => {
      const key = "test:delete:1";
      await cacheService.set(key, { active: true });

      const deletedCount = await cacheService.del(key);
      expect(deletedCount).toBeGreaterThanOrEqual(1);

      const check = await cacheService.get(key);
      expect(check).toBeNull();
    });

    it("deletes multiple keys by pattern using SCAN cursor iteration", async () => {
      await cacheService.set("test:pattern:a", { item: "A" });
      await cacheService.set("test:pattern:b", { item: "B" });
      await cacheService.set("test:other:c", { item: "C" });

      const deletedCount = await cacheService.delByPattern("test:pattern:*");
      expect(deletedCount).toBe(2);

      expect(await cacheService.get("test:pattern:a")).toBeNull();
      expect(await cacheService.get("test:pattern:b")).toBeNull();
      expect(await cacheService.get("test:other:c")).not.toBeNull();
    });
  });

  describe("cacheResponse Express middleware", () => {
    let app;
    let handlerCounter = 0;

    beforeEach(async () => {
      await cacheService.delByPattern("api:test:*");
      handlerCounter = 0;

      app = express();
      app.use(express.json());

      // Route using caching middleware
      app.get(
        "/api/items",
        cacheResponse("api:test:items", 60),
        (req, res) => {
          handlerCounter++;
          res.status(200).json({
            count: handlerCounter,
            items: ["item1", "item2"],
          });
        }
      );

      // Detail route with param
      app.get(
        "/api/items/:id",
        cacheResponse("api:test:detail", 60),
        (req, res) => {
          handlerCounter++;
          res.status(200).json({
            id: req.params.id,
            counter: handlerCounter,
          });
        }
      );

      // Error route that returns 404 (should never be cached)
      app.get(
        "/api/error",
        cacheResponse("api:test:err", 60),
        (req, res) => {
          handlerCounter++;
          res.status(404).json({ error: "Item not found" });
        }
      );

      // POST route (should be bypassed by middleware)
      app.post(
        "/api/items",
        cacheResponse("api:test:items", 60),
        (req, res) => {
          res.status(201).json({ created: true });
        }
      );
    });

    it("returns X-Cache: MISS on first request, then X-Cache: HIT on subsequent request", async () => {
      // 1. First request -> MISS
      const res1 = await request(app).get("/api/items?city=Algiers");
      expect(res1.status).toBe(200);
      expect(res1.headers["x-cache"]).toBe("MISS");
      expect(res1.body.count).toBe(1);
      expect(handlerCounter).toBe(1);

      // 2. Second request with same query -> HIT (handler is skipped!)
      const res2 = await request(app).get("/api/items?city=Algiers");
      expect(res2.status).toBe(200);
      expect(res2.headers["x-cache"]).toBe("HIT");
      expect(res2.body.count).toBe(1);
      expect(handlerCounter).toBe(1); // Handler was not executed again!
    });

    it("serves cache HIT when query params are in different order", async () => {
      const res1 = await request(app).get("/api/items?page=1&city=Oran");
      expect(res1.headers["x-cache"]).toBe("MISS");

      const res2 = await request(app).get("/api/items?city=Oran&page=1");
      expect(res2.headers["x-cache"]).toBe("HIT");
      expect(handlerCounter).toBe(1);
    });

    it("bypasses cache when Cache-Control: no-cache header is sent", async () => {
      // Warm up cache
      await request(app).get("/api/items");

      // Send with bypass header
      const resBypass = await request(app)
        .get("/api/items")
        .set("Cache-Control", "no-cache");

      expect(resBypass.headers["x-cache"]).toBe("BYPASS");
      expect(handlerCounter).toBe(2);
    });

    it("does not cache non-GET requests", async () => {
      const res = await request(app).post("/api/items").send({ name: "New" });
      expect(res.status).toBe(201);
      expect(res.headers["x-cache"]).toBeUndefined();
    });

    it("does not cache 4xx error responses", async () => {
      const res1 = await request(app).get("/api/error");
      expect(res1.status).toBe(404);
      expect(res1.headers["x-cache"]).toBe("MISS");

      const res2 = await request(app).get("/api/error");
      expect(res2.status).toBe(404);
      expect(res2.headers["x-cache"]).toBe("MISS");
      expect(handlerCounter).toBe(2); // Not cached!
    });

    it("invalidates cache after delByPattern is called", async () => {
      // 1. Populate cache
      await request(app).get("/api/items:1");
      const res1 = await request(app).get("/api/items/100");
      expect(res1.headers["x-cache"]).toBe("MISS");

      const res2 = await request(app).get("/api/items/100");
      expect(res2.headers["x-cache"]).toBe("HIT");

      // 2. Invalidate cache pattern
      await cacheService.delByPattern("api:test:*");

      // 3. Request again -> MISS
      const res3 = await request(app).get("/api/items/100");
      expect(res3.headers["x-cache"]).toBe("MISS");
    });
  });
});
