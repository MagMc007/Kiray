import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockInitializeFirebaseAdmin = jest.fn();
const mockFindUser = jest.fn();
const mockGetFlaggedListings = jest.fn();
const mockResolveListingFlags = jest.fn();

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: mockInitializeFirebaseAdmin,
}));

jest.unstable_mockModule("../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  __esModule: true,
  default: {
    findOne: mockFindUser,
  },
}));

jest.unstable_mockModule("../src/services/adminModerationService.js", () => ({
  __esModule: true,
  getFlaggedListings: mockGetFlaggedListings,
  resolveListingFlags: mockResolveListingFlags,
}));

let app;

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || err.status || 500).json({
    success: false,
    error: err.message,
  });
};

describe("Admin moderation routes (/api/v1/admin)", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    mockInitializeFirebaseAdmin.mockReset();
    mockFindUser.mockReset();
    mockGetFlaggedListings.mockReset();
    mockResolveListingFlags.mockReset();

    const adminRoutes = (await import("../src/routes/v1/adminRoutes.js"))
      .default;

    app = express();
    app.use(express.json());
    app.use("/api/v1/admin", adminRoutes);
    app.use(errorHandler);
  });

  it("returns 401 when no token is provided for GET /api/v1/admin/flagged", async () => {
    const res = await request(app).get("/api/v1/admin/flagged");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(mockGetFlaggedListings).not.toHaveBeenCalled();
  });

  it("blocks non-admin users from accessing GET /api/v1/admin/flagged", async () => {
    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest
          .fn()
          .mockResolvedValue({ uid: "regular-user-uid" }),
      }),
    });
    mockFindUser.mockResolvedValue({
      _id: "60d0fe4f5311236168a109c9",
      firebaseUid: "regular-user-uid",
      role: "rentee",
    });

    const res = await request(app)
      .get("/api/v1/admin/flagged")
      .set("Authorization", "Bearer regular-user-token");

    expect([401, 403]).toContain(res.status);
    expect(res.body.error).toBeDefined();
    expect(mockGetFlaggedListings).not.toHaveBeenCalled();
  });

  it("allows admin user to fetch flagged listings", async () => {
    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: "admin-user-uid" }),
      }),
    });
    mockFindUser.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      firebaseUid: "admin-user-uid",
      role: "admin",
    });
    mockGetFlaggedListings.mockResolvedValue({
      listings: [
        {
          _id: "listing-123",
          title: "Flagged House",
          isFlagged: true,
          flagReason: "Inaccurate pricing",
        },
      ],
      meta: { page: 1, limit: 20, totalItems: 1 },
    });

    const res = await request(app)
      .get("/api/v1/admin/flagged")
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockGetFlaggedListings).toHaveBeenCalled();
  });

  it("blocks non-admin users from PATCH /api/v1/admin/listings/:id/resolve", async () => {
    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest
          .fn()
          .mockResolvedValue({ uid: "regular-user-uid" }),
      }),
    });
    mockFindUser.mockResolvedValue({
      _id: "60d0fe4f5311236168a109c9",
      firebaseUid: "regular-user-uid",
      role: "landlord",
    });

    const res = await request(app)
      .patch("/api/v1/admin/listings/listing-123/resolve")
      .set("Authorization", "Bearer regular-user-token");

    expect([401, 403]).toContain(res.status);
    expect(mockResolveListingFlags).not.toHaveBeenCalled();
  });

  it("allows admin to resolve flagged listing", async () => {
    const adminUser = {
      _id: "507f191e810c19729de860ea",
      firebaseUid: "admin-user-uid",
      role: "admin",
    };
    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: "admin-user-uid" }),
      }),
    });
    mockFindUser.mockResolvedValue(adminUser);
    mockResolveListingFlags.mockResolvedValue({
      _id: "listing-123",
      title: "Resolved Villa",
      isFlagged: false,
      flagReason: null,
      status: "open",
    });

    const res = await request(app)
      .patch("/api/v1/admin/listings/listing-123/resolve")
      .set("Authorization", "Bearer admin-token")
      .send({ notes: "Verified details" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isFlagged).toBe(false);
    expect(mockResolveListingFlags).toHaveBeenCalled();
  });
});
