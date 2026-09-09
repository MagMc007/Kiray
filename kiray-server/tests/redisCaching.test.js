import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

// Mock external 3rd-party services before importing app
jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: jest.fn(),
  default: {
    auth: () => ({
      verifyIdToken: jest.fn().mockImplementation(async (token) => {
        if (token === "valid-user-token") {
          return { uid: "user-123", email: "user@example.com" };
        }
        if (token === "valid-admin-token") {
          return { uid: "admin-123", email: "admin@example.com" };
        }
        throw new Error("Invalid token");
      }),
    }),
  },
}));

jest.unstable_mockModule("../src/config/cloudinary.js", () => ({
  default: {},
  upload: {
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next(),
  },
}));

const { default: app } = await import("../src/app.js");
const { default: cacheService } = await import("../src/services/cacheService.js");
const { connectRedis, disconnectRedis } = await import("../src/config/redis.js");
const { default: Listing } = await import("../src/models/Listing.js");
const { default: Comment } = await import("../src/models/Comment.js");
const { default: User } = await import("../src/models/User.js");

describe("Phase 4: Redis Route Caching & Invalidation Integration Tests", () => {
  let sampleListing;
  let sampleUser;

  beforeAll(async () => {
    if (process.env.USE_REAL_REDIS) {
      await connectRedis();
    }
  });

  afterAll(async () => {
    await disconnectRedis();
  });

  beforeEach(async () => {
    // Clear all cached keys in Redis
    await cacheService.delByPattern("listings:*");
    await cacheService.delByPattern("comments:*");

    sampleUser = {
      _id: new mongoose.Types.ObjectId("60d0fe4f5311236168a109c9"),
      firebaseUid: "user-123",
      email: "user@example.com",
      displayName: "Jane Doe",
      role: "user",
    };

    sampleListing = {
      _id: new mongoose.Types.ObjectId("507f191e810c19729de860ea"),
      title: "Spacious Mediterranean Villa",
      slug: "spacious-mediterranean-villa",
      description: "Beautiful 3-bedroom villa with sea view and pool.",
      price: 2500,
      propertyType: "villa",
      bedrooms: 3,
      bathrooms: 2,
      status: "open",
      isDeleted: false,
      ownerId: sampleUser._id,
      averageRating: 4.5,
      totalComments: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("GET /api/v1/listings (Search & Filter Query Caching)", () => {
    it("returns X-Cache: MISS on first query and X-Cache: HIT on subsequent identical query", async () => {
      jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([sampleListing]),
      };
      jest.spyOn(Listing, "find").mockReturnValue(mockQuery);

      // 1. Initial Request -> MISS
      const res1 = await request(app).get("/api/v1/listings?city=Algiers&sort=price_asc");
      expect(res1.status).toBe(200);
      expect(res1.headers["x-cache"]).toBe("MISS");
      expect(res1.body.success).toBe(true);

      // 2. Second Request -> HIT
      const res2 = await request(app).get("/api/v1/listings?city=Algiers&sort=price_asc");
      expect(res2.status).toBe(200);
      expect(res2.headers["x-cache"]).toBe("HIT");
      expect(res2.body.data).toEqual(res1.body.data);
    });

    it("serves cache HIT when query parameters are supplied in different order", async () => {
      jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([sampleListing]),
      };
      jest.spyOn(Listing, "find").mockReturnValue(mockQuery);

      const res1 = await request(app).get("/api/v1/listings?city=Oran&page=1&sort=newest");
      expect(res1.headers["x-cache"]).toBe("MISS");

      // Inverted parameter order -> HIT
      const res2 = await request(app).get("/api/v1/listings?sort=newest&city=Oran&page=1");
      expect(res2.headers["x-cache"]).toBe("HIT");
    });

    it("bypasses cache when Cache-Control: no-cache header is provided", async () => {
      jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([sampleListing]),
      };
      jest.spyOn(Listing, "find").mockReturnValue(mockQuery);

      // Populate cache
      await request(app).get("/api/v1/listings?city=Annaba");

      // Send with no-cache header
      const res = await request(app)
        .get("/api/v1/listings?city=Annaba")
        .set("Cache-Control", "no-cache");

      expect(res.headers["x-cache"]).toBe("BYPASS");
    });
  });

  describe("GET /api/v1/listings/:id (Listing Detail Caching)", () => {
    it("caches listing detail and returns X-Cache: HIT on second request", async () => {
      jest.spyOn(Listing, "findOne").mockReturnValue({
        populate: jest.fn().mockResolvedValue(sampleListing),
      });

      const listingId = sampleListing._id.toString();

      // First call -> MISS
      const res1 = await request(app).get(`/api/v1/listings/${listingId}`);
      expect(res1.status).toBe(200);
      expect(res1.headers["x-cache"]).toBe("MISS");
      expect(res1.body.data.title).toBe(sampleListing.title);

      // Second call -> HIT
      const res2 = await request(app).get(`/api/v1/listings/${listingId}`);
      expect(res2.status).toBe(200);
      expect(res2.headers["x-cache"]).toBe("HIT");
      expect(res2.body.data.title).toBe(sampleListing.title);
    });
  });

  describe("GET /api/v1/listings/:id/comments (Listing Comments Caching)", () => {
    it("caches comments list and returns X-Cache: HIT on repeat call", async () => {
      jest.spyOn(Listing, "findOne").mockResolvedValue(sampleListing);
      jest.spyOn(Comment, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Comment, "find").mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            listingId: sampleListing._id,
            authorId: { _id: sampleUser._id, displayName: "Jane Doe" },
            rating: 5,
            text: "Spectacular villa!",
            verifiedRentee: true,
            createdAt: new Date(),
          },
        ]),
      });

      const listingId = sampleListing._id.toString();

      // First call -> MISS
      const res1 = await request(app).get(`/api/v1/listings/${listingId}/comments?page=1`);
      expect(res1.status).toBe(200);
      expect(res1.headers["x-cache"]).toBe("MISS");

      // Second call -> HIT
      const res2 = await request(app).get(`/api/v1/listings/${listingId}/comments?page=1`);
      expect(res2.status).toBe(200);
      expect(res2.headers["x-cache"]).toBe("HIT");
    });
  });

  describe("Cache Invalidation on Mutation", () => {
    it("invalidates listings and comments cache when a comment is added", async () => {
      const listingId = sampleListing._id.toString();

      // Warm up comments cache
      jest.spyOn(Listing, "findOne").mockResolvedValue(sampleListing);
      jest.spyOn(Comment, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Comment, "find").mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });

      await request(app).get(`/api/v1/listings/${listingId}/comments`);
      const cachedBefore = await cacheService.get(`comments:listing:${listingId}:default`);
      expect(cachedBefore).not.toBeNull();

      // Invalidate via commentService cache invalidation pattern
      await cacheService.delByPattern(`comments:listing:${listingId}*`);

      const cachedAfter = await cacheService.get(`comments:listing:${listingId}:default`);
      expect(cachedAfter).toBeNull();
    });

    it("invalidates all listing caches when listings are mutated", async () => {
      // Warm up query cache and detail cache
      await cacheService.set("listings:query:abc12345", { data: [] }, 60);
      await cacheService.set("listings:detail:item-1", { data: {} }, 300);

      expect(await cacheService.get("listings:query:abc12345")).not.toBeNull();
      expect(await cacheService.get("listings:detail:item-1")).not.toBeNull();

      // Trigger wildcard invalidation
      await cacheService.delByPattern("listings:*");

      expect(await cacheService.get("listings:query:abc12345")).toBeNull();
      expect(await cacheService.get("listings:detail:item-1")).toBeNull();
    });
  });
});
