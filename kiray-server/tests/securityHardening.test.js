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

const { authLimiter, uploadLimiter, globalLimiter } = await import("../src/middleware/rateLimiters.js");
const { default: mongoSanitize } = await import("express-mongo-sanitize");
const { default: helmet } = await import("helmet");
const { default: errorHandler } = await import("../src/middleware/errorHandler.js");

describe("Security Hardening Subplan (feat/security-hardening)", () => {
  describe("NoSQL Input Sanitization Middleware", () => {
    let testApp;

    beforeEach(() => {
      testApp = express();
      testApp.use(express.json());
      testApp.use(mongoSanitize());

      testApp.post("/test-sanitize", (req, res) => {
        res.status(200).json({ success: true, body: req.body });
      });
    });

    it("strips NoSQL injection operators ($gt, $ne) from request body", async () => {
      const res = await request(testApp)
        .post("/test-sanitize")
        .send({ username: { "$gt": "" }, password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.body.username).toEqual({});
      expect(res.body.body.password).toBe("password123");
    });
  });

  describe("Targeted Rate Limiters", () => {
    it("authLimiter returns 429 when request count exceeds threshold", async () => {
      const testApp = express();
      testApp.use(express.json());

      const customAuthLimiter = (await import("express-rate-limit")).default({
        windowMs: 15 * 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
          res.status(options.statusCode).json({
            success: false,
            error: "Too many authentication requests, please try again later.",
          });
        },
      });

      testApp.use("/auth", customAuthLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });

      for (let i = 0; i < 3; i++) {
        const res = await request(testApp).get("/auth/sync");
        expect(res.status).toBe(200);
      }

      const blockedRes = await request(testApp).get("/auth/sync");
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body).toEqual({
        success: false,
        error: "Too many authentication requests, please try again later.",
      });
    });

    it("uploadLimiter returns 429 when upload threshold is exceeded", async () => {
      const testApp = express();
      testApp.use(express.json());

      const customUploadLimiter = (await import("express-rate-limit")).default({
        windowMs: 15 * 60 * 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
          res.status(options.statusCode).json({
            success: false,
            error: "Too many image upload attempts, please try again later.",
          });
        },
      });

      testApp.post("/upload", customUploadLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });

      await request(testApp).post("/upload");
      await request(testApp).post("/upload");

      const blockedRes = await request(testApp).post("/upload");
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body).toEqual({
        success: false,
        error: "Too many image upload attempts, please try again later.",
      });
    });
  });

  describe("Helmet Security Headers Integration", () => {
    it("sets standard security headers on response", async () => {
      const testApp = express();
      testApp.use(helmet());
      testApp.get("/test-headers", (req, res) => {
        res.status(200).json({ success: true });
      });

      const res = await request(testApp).get("/test-headers");

      expect(res.status).toBe(200);
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
      expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    });
  });
});
