import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockInitializeFirebaseAdmin = jest.fn();
const mockFindUser = jest.fn();
const mockGetSavedListings = jest.fn();

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: mockInitializeFirebaseAdmin,
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  __esModule: true,
  default: {
    findOne: mockFindUser,
  },
}));

jest.unstable_mockModule("../src/services/favoriteService.js", () => ({
  getSavedListings: mockGetSavedListings,
}));

let app;

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || err.status || 500).json({
    success: false,
    error: err.message,
  });
};

describe("saved-listings route auth", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    mockInitializeFirebaseAdmin.mockReset();
    mockFindUser.mockReset();
    mockGetSavedListings.mockReset();

    const userRoutes = (await import("../src/routes/v1/userRoutes.js")).default;
    app = express();
    app.use("/api/v1/users", userRoutes);
    app.use(errorHandler);
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/v1/users/me/saved-listings");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(mockGetSavedListings).not.toHaveBeenCalled();
  });

  it("returns saved listings for an authenticated user", async () => {
    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: "firebase-uid" }),
      }),
    });
    mockFindUser.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      firebaseUid: "firebase-uid",
    });
    mockGetSavedListings.mockResolvedValue({
      results: [],
      meta: { page: 1, limit: 20, total: 0 },
    });

    const res = await request(app)
      .get("/api/v1/users/me/saved-listings")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockGetSavedListings).toHaveBeenCalledWith(
      "507f191e810c19729de860ea",
      { page: undefined, limit: undefined },
    );
  });
});