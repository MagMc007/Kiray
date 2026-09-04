import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: jest.fn(),
  default: {
    auth: () => ({
      verifyIdToken: jest.fn(),
    }),
  },
}));

jest.unstable_mockModule("../src/config/cloudinary.js", () => ({
  default: {},
}));

const {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} = await import("../src/utils/errors/index.js");
const { default: errorHandler } = await import("../src/middleware/errorHandler.js");

describe("Error Handling Consistency Subplan (feat/error-handling-consistency)", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("Global Error Middleware Unit Tests", () => {
    it("handles NotFoundError with 404 and correct error envelope", () => {
      const err = new NotFoundError("Listing not found");
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Listing not found",
      });
    });

    it("handles ValidationError with 400, correct message, and details array", () => {
      const details = ["Title is required", "Price must be positive"];
      const err = new ValidationError("Validation failed", details);
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation failed",
        details: ["Title is required", "Price must be positive"],
      });
    });

    it("handles UnauthorizedError with 401 and correct error envelope", () => {
      const err = new UnauthorizedError("Authentication token invalid");
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Authentication token invalid",
      });
    });

    it("handles ForbiddenError with 403 and correct error envelope", () => {
      const err = new ForbiddenError("Insufficient permissions");
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Insufficient permissions",
      });
    });

    it("handles ConflictError with 409 and correct error envelope", () => {
      const err = new ConflictError("User already exists");
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "User already exists",
      });
    });

    it("handles generic AppError with custom status code", () => {
      const err = new AppError("Unprocessable entity", 422);
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Unprocessable entity",
      });
    });

    it("handles Multer LIMIT_FILE_SIZE error with 413", () => {
      const err = new Error("File too large");
      err.name = "MulterError";
      err.code = "LIMIT_FILE_SIZE";

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "File too large",
      });
    });

    it("handles generic MulterError with 400", () => {
      const err = new Error("Unexpected field");
      err.name = "MulterError";
      err.code = "LIMIT_UNEXPECTED_FILE";

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Unexpected field",
      });
    });

    it("handles unknown internal server errors with 500", () => {
      const err = new Error("Database connection lost");
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
      });
    });
  });

  describe("Integration Tests via Express Supertest App", () => {
    let testApp;

    beforeEach(() => {
      testApp = express();
      testApp.use(express.json());

      testApp.get("/test/not-found", (req, res, next) => {
        next(new NotFoundError("Test resource not found"));
      });

      testApp.get("/test/validation", (req, res, next) => {
        next(new ValidationError("Invalid query", ["param x required"]));
      });

      testApp.use((req, res) => {
        res.status(404).json({ success: false, error: "Route not found" });
      });

      testApp.use(errorHandler);
    });

    it("returns 404 with standard error envelope for undefined routes", async () => {
      const response = await request(testApp).get("/api/v1/route-that-does-not-exist");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: "Route not found",
      });
    });

    it("forwards custom errors to errorHandler middleware returning correct envelope", async () => {
      const res1 = await request(testApp).get("/test/not-found");
      expect(res1.status).toBe(404);
      expect(res1.body).toEqual({
        success: false,
        error: "Test resource not found",
      });

      const res2 = await request(testApp).get("/test/validation");
      expect(res2.status).toBe(400);
      expect(res2.body).toEqual({
        success: false,
        error: "Invalid query",
        details: ["param x required"],
      });
    });
  });
});
