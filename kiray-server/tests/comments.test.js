import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockInitializeFirebaseAdmin = jest.fn();
const mockFindUser = jest.fn();

const mockAddComment = jest.fn();
const mockGetListingComments = jest.fn();
const mockUpdateComment = jest.fn();
const mockDeleteComment = jest.fn();

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: mockInitializeFirebaseAdmin,
  default: {
    auth: () => ({
      verifyIdToken: jest.fn(),
    }),
  },
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  __esModule: true,
  default: {
    findOne: mockFindUser,
  },
}));

jest.unstable_mockModule("../src/services/commentService.js", () => ({
  addComment: mockAddComment,
  getListingComments: mockGetListingComments,
  updateComment: mockUpdateComment,
  deleteComment: mockDeleteComment,
}));

const listingId = "507f191e810c19729de860ea";
const authorId = "507f191e810c19729de860eb";
const otherUserId = "507f191e810c19729de860ec";
const adminUserId = "507f191e810c19729de860ed";
const commentId = "507f191e810c19729de860ef";

describe("Comment Route Integration Tests", () => {
  let app;

  const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || err.status || 500).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({
        verifyIdToken: jest.fn().mockImplementation(async (token) => {
          if (token === "valid-author-token") {
            return { uid: "firebase-author-uid" };
          }
          if (token === "valid-other-token") {
            return { uid: "firebase-other-uid" };
          }
          if (token === "valid-admin-token") {
            return { uid: "firebase-admin-uid" };
          }
          throw new Error("Invalid token");
        }),
      }),
    });

    mockFindUser.mockImplementation(async (query) => {
      if (query.firebaseUid === "firebase-author-uid") {
        return { _id: authorId, firebaseUid: "firebase-author-uid", role: "rentee" };
      }
      if (query.firebaseUid === "firebase-other-uid") {
        return { _id: otherUserId, firebaseUid: "firebase-other-uid", role: "rentee" };
      }
      if (query.firebaseUid === "firebase-admin-uid") {
        return { _id: adminUserId, firebaseUid: "firebase-admin-uid", role: "admin" };
      }
      return null;
    });

    const commentRoutes = (await import("../src/routes/v1/commentRoutes.js")).default;
    app = express();
    app.use(express.json());
    app.use("/api/v1/listings/:id/comments", commentRoutes);
    app.use(errorHandler);
  });

  it("POST /api/v1/listings/:id/comments returns 401 when unauthenticated", async () => {
    const res = await request(app)
      .post(`/api/v1/listings/${listingId}/comments`)
      .send({ rating: 5, text: "Great place!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/listings/:id/comments returns 400 on invalid payload", async () => {
    const res = await request(app)
      .post(`/api/v1/listings/${listingId}/comments`)
      .set("Authorization", "Bearer valid-author-token")
      .send({ rating: 10, text: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/listings/:id/comments creates comment when valid", async () => {
    const createdComment = {
      _id: commentId,
      listingId,
      authorId: { _id: authorId, displayName: "Jane Doe" },
      rating: 5,
      text: "Wonderful place!",
      verifiedRentee: false,
    };
    mockAddComment.mockResolvedValue(createdComment);

    const res = await request(app)
      .post(`/api/v1/listings/${listingId}/comments`)
      .set("Authorization", "Bearer valid-author-token")
      .send({ rating: 5, text: "Wonderful place!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Comment created successfully");
    expect(res.body.data.text).toBe("Wonderful place!");
    expect(mockAddComment).toHaveBeenCalledWith(listingId, authorId, {
      rating: 5,
      text: "Wonderful place!",
      verifiedRentee: false,
    });
  });

  it("GET /api/v1/listings/:id/comments returns comments list", async () => {
    mockGetListingComments.mockResolvedValue({
      comments: [{ _id: commentId, rating: 5, text: "Nice place!" }],
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: 1,
        hasNext: false,
        hasPrev: false,
      },
    });

    const res = await request(app).get(`/api/v1/listings/${listingId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comments).toHaveLength(1);
    expect(mockGetListingComments).toHaveBeenCalledWith(listingId, {});
  });

  it("PUT /api/v1/listings/:id/comments/:commentId updates comment by author", async () => {
    const updatedComment = {
      _id: commentId,
      rating: 4,
      text: "Updated via HTTP",
    };
    mockUpdateComment.mockResolvedValue(updatedComment);

    const res = await request(app)
      .put(`/api/v1/listings/${listingId}/comments/${commentId}`)
      .set("Authorization", "Bearer valid-author-token")
      .send({ rating: 4, text: "Updated via HTTP" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe("Updated via HTTP");
    expect(mockUpdateComment).toHaveBeenCalledWith(commentId, authorId, {
      rating: 4,
      text: "Updated via HTTP",
    });
  });

  it("DELETE /api/v1/listings/:id/comments/:commentId soft-deletes comment", async () => {
    mockDeleteComment.mockResolvedValue({ message: "Comment deleted successfully" });

    const res = await request(app)
      .delete(`/api/v1/listings/${listingId}/comments/${commentId}`)
      .set("Authorization", "Bearer valid-author-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Comment deleted successfully");
    expect(mockDeleteComment).toHaveBeenCalledWith(commentId, authorId, "rentee");
  });
});
