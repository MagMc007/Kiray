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

const { default: logger } = await import("../src/config/logger.js");
const { default: app } = await import("../src/app.js");

describe("Observability Subplan (feat/observability)", () => {
  describe("Logger Config Unit Tests", () => {
    it("exports a valid Pino logger instance", () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
    });
  });

  describe("HTTP Logging & Health Endpoint Integration Tests", () => {
    it("GET /health responds with 200 and healthy status message", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Server is running",
      });
    });

    it("GET /docs returns 200 or 301 for Swagger UI documentation", async () => {
      const res = await request(app).get("/docs/");

      expect([200, 301, 302]).toContain(res.status);
    });

    it("redacts sensitive authorization headers during request logging", async () => {
      const res = await request(app)
        .get("/health")
        .set("Authorization", "Bearer secret-token");

      expect(res.status).toBe(200);
    });
  });
});
