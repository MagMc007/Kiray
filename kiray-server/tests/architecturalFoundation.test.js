import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import User from "../src/models/User.js";
import Listing from "../src/models/Listing.js";
import AuditLog from "../src/models/AuditLog.js";
import Report from "../src/models/Report.js";
import { logAuditAction } from "../src/utils/auditLogger.js";
import { ForbiddenError } from "../src/utils/errors/index.js";
import { requireAdmin, requireRole } from "../src/middleware/listingAccess.js";

describe("Step 1: Architectural Foundation & Prerequisites", () => {
  describe("User Model Status Field", () => {
    it("defaults to active status", () => {
      const user = new User({
        firebaseUid: "uid_123",
        role: "rentee",
        displayName: "Test User",
        email: "test@example.com",
      });
      expect(user.status).toBe("active");
    });

    it("accepts valid status values (active, suspended, banned)", () => {
      const suspendedUser = new User({
        firebaseUid: "uid_456",
        role: "landlord",
        status: "suspended",
        displayName: "Suspended Owner",
        email: "owner@example.com",
      });
      expect(suspendedUser.status).toBe("suspended");

      const bannedUser = new User({
        firebaseUid: "uid_789",
        role: "rentee",
        status: "banned",
        displayName: "Banned User",
        email: "banned@example.com",
      });
      expect(bannedUser.status).toBe("banned");
    });

    it("fails validation on invalid status", () => {
      const invalidUser = new User({
        firebaseUid: "uid_000",
        role: "rentee",
        status: "invalid_status",
        displayName: "Invalid User",
        email: "invalid@example.com",
      });
      const err = invalidUser.validateSync();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe("Listing Model Extended Admin Flags", () => {
    it("defaults isVerified, isFeatured, and deactivatedByAdmin to false", () => {
      const listing = new Listing({
        ownerId: "507f191e810c19729de860ea",
        title: "Test Apartment",
        slug: "test-apartment",
        description: "Test description",
        price: 1000,
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        location: { type: "Point", coordinates: [38.74, 9.03] },
        address: { street: "Main St", city: "Addis Ababa" },
      });
      expect(listing.isVerified).toBe(false);
      expect(listing.isFeatured).toBe(false);
      expect(listing.deactivatedByAdmin).toBe(false);
    });
  });

  describe("AuditLog Model & Logger Helper", () => {
    it("creates an AuditLog document via logAuditAction helper", async () => {
      jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);

      const result = await logAuditAction({
        adminId: "507f191e810c19729de860ea",
        action: "SUSPEND_USER",
        targetType: "User",
        targetId: "507f191e810c19729de860eb",
        metadata: { reason: "Policy violation" },
        ipAddress: "127.0.0.1",
      });

      expect(result).toBeDefined();
      expect(result.action).toBe("SUSPEND_USER");
      expect(result.targetType).toBe("User");
      expect(result.ipAddress).toBe("127.0.0.1");
    });
  });

  describe("Report Model", () => {
    it("creates a valid Report document with default status pending", () => {
      const report = new Report({
        listingId: "507f191e810c19729de860ea",
        reporterId: "507f191e810c19729de860eb",
        reason: "Misleading price",
        notes: "Advertised 500 ETB but requested 5000 ETB",
      });

      expect(report.status).toBe("pending");
      expect(report.reason).toBe("Misleading price");
    });
  });

  describe("ForbiddenError & Middleware Authorization (403)", () => {
    it("instantiates ForbiddenError with status code 403", () => {
      const err = new ForbiddenError("Admin access required");
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe("Admin access required");
    });

    it("requireAdmin throws ForbiddenError for non-admin user", () => {
      const nonAdmin = { role: "landlord" };
      expect(() => requireAdmin(nonAdmin)).toThrow(ForbiddenError);
    });

    it("requireRole throws ForbiddenError for unauthorized roles", () => {
      const req = { user: { role: "rentee" } };
      let passedError = null;
      const next = (err) => {
        passedError = err;
      };

      requireRole("landlord")(req, {}, next);
      expect(passedError).toBeInstanceOf(ForbiddenError);
      expect(passedError.statusCode).toBe(403);
    });
  });
});
