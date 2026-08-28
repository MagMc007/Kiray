import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import User from "../src/models/User.js";
import Listing from "../src/models/Listing.js";
import Report from "../src/models/Report.js";
import AuditLog from "../src/models/AuditLog.js";
import * as adminDashboardService from "../src/services/adminDashboardService.js";
import * as adminUserService from "../src/services/adminUserService.js";
import { NotFoundError, ValidationError } from "../src/utils/errors/index.js";

const mockAdminUser = {
  _id: "507f191e810c19729de860aa",
  role: "admin",
  displayName: "System Admin",
};

const mockTargetUser = {
  _id: "507f191e810c19729de860bb",
  role: "rentee",
  status: "active",
  displayName: "John Doe",
  email: "john@example.com",
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
};

describe("Module 1: Admin Dashboard & Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getDashboardOverview returns aggregated system metrics", async () => {
    jest.spyOn(User, "countDocuments").mockImplementation((query) => {
      if (query.status === "active") return Promise.resolve(10);
      if (query.status === "suspended") return Promise.resolve(2);
      if (query.status === "banned") return Promise.resolve(1);
      if (query.role === "landlord") return Promise.resolve(5);
      if (query.role === "rentee") return Promise.resolve(7);
      if (query.role === "admin") return Promise.resolve(1);
      return Promise.resolve(13);
    });

    jest.spyOn(Listing, "countDocuments").mockImplementation((query) => {
      if (query.status === "open") return Promise.resolve(20);
      if (query.isFlagged === true) return Promise.resolve(3);
      return Promise.resolve(25);
    });

    jest.spyOn(Report, "countDocuments").mockResolvedValue(4);

    const result = await adminDashboardService.getDashboardOverview();

    expect(result.users.total).toBe(13);
    expect(result.users.active).toBe(10);
    expect(result.users.suspended).toBe(2);
    expect(result.users.banned).toBe(1);
    expect(result.users.byRole.landlord).toBe(5);
    expect(result.listings.total).toBe(25);
    expect(result.listings.active).toBe(20);
    expect(result.listings.flagged).toBe(3);
    expect(result.reports.pending).toBe(4);
  });

  it("getActivityAnalytics returns timeseries data for requested period", async () => {
    jest.spyOn(User, "aggregate").mockResolvedValue([
      { _id: "2026-08-28", count: 5 },
    ]);
    jest.spyOn(Listing, "aggregate").mockResolvedValue([
      { _id: "2026-08-28", count: 8 },
    ]);

    const result = await adminDashboardService.getActivityAnalytics({ period: "7d" });

    expect(result.period).toBe("7d");
    expect(result.userSignups).toEqual([{ date: "2026-08-28", count: 5 }]);
    expect(result.listingCreations).toEqual([{ date: "2026-08-28", count: 8 }]);
  });
});

describe("Module 2: User Moderation & Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);
  });

  describe("listUsers", () => {
    it("returns paginated users list matching filter criteria", async () => {
      const mockUsers = [mockTargetUser];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers),
      };

      jest.spyOn(User, "find").mockReturnValue(mockQuery);
      jest.spyOn(User, "countDocuments").mockResolvedValue(1);

      const result = await adminUserService.listUsers({
        page: 1,
        limit: 10,
        role: "rentee",
        status: "active",
      });

      expect(result.users).toEqual(mockUsers);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe("getUserDetail", () => {
    it("returns user details with related listing and report stats", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTargetUser),
      });
      jest.spyOn(Listing, "countDocuments").mockImplementation((query) => {
        if (query.status === "open") return Promise.resolve(3);
        if (query.isDeleted === true) return Promise.resolve(1);
        return Promise.resolve(4);
      });
      jest.spyOn(Report, "countDocuments").mockResolvedValue(2);

      const result = await adminUserService.getUserDetail(mockTargetUser._id);

      expect(result.user).toEqual(mockTargetUser);
      expect(result.stats.totalListings).toBe(4);
      expect(result.stats.activeListings).toBe(3);
      expect(result.stats.deletedListings).toBe(1);
      expect(result.stats.reportsSubmitted).toBe(2);
    });

    it("throws NotFoundError if user does not exist", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        adminUserService.getUserDetail("507f191e810c19729de86000")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateUserStatus", () => {
    it("updates user status and writes audit log", async () => {
      const userDoc = {
        ...mockTargetUser,
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findById").mockResolvedValue(userDoc);

      const result = await adminUserService.updateUserStatus(
        mockAdminUser,
        mockTargetUser._id,
        "suspended",
        "Repeated spam reports"
      );

      expect(result.status).toBe("suspended");
      expect(userDoc.save).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "USER_STATUS_SUSPENDED",
          targetType: "User",
        })
      );
    });

    it("prevents administrators from modifying their own status", async () => {
      await expect(
        adminUserService.updateUserStatus(
          mockAdminUser,
          mockAdminUser._id,
          "suspended"
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateUserRole", () => {
    it("updates user role and writes audit log", async () => {
      const userDoc = {
        ...mockTargetUser,
        role: "rentee",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findById").mockResolvedValue(userDoc);

      const result = await adminUserService.updateUserRole(
        mockAdminUser,
        mockTargetUser._id,
        "admin"
      );

      expect(result.role).toBe("admin");
      expect(userDoc.save).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "USER_ROLE_CHANGE",
          targetType: "User",
        })
      );
    });

    it("prevents administrators from modifying their own role", async () => {
      await expect(
        adminUserService.updateUserRole(
          mockAdminUser,
          mockAdminUser._id,
          "landlord"
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("softDeleteUser & restoreUser", () => {
    it("soft deletes user and cascades deactivation to listings", async () => {
      const userDoc = {
        ...mockTargetUser,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findOne").mockResolvedValue(userDoc);
      jest.spyOn(Listing, "updateMany").mockResolvedValue({ modifiedCount: 2 });

      const result = await adminUserService.softDeleteUser(
        mockAdminUser,
        mockTargetUser._id
      );

      expect(result.isDeleted).toBe(true);
      expect(Listing.updateMany).toHaveBeenCalledWith(
        { ownerId: mockTargetUser._id, isDeleted: false },
        expect.objectContaining({ isDeleted: true, deactivatedByAdmin: true })
      );
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "USER_SOFT_DELETE" })
      );
    });

    it("restores a soft deleted user account", async () => {
      const deletedUserDoc = {
        ...mockTargetUser,
        isDeleted: true,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findById").mockResolvedValue(deletedUserDoc);

      const result = await adminUserService.restoreUser(
        mockAdminUser,
        mockTargetUser._id
      );

      expect(result.isDeleted).toBe(false);
      expect(result.deletedAt).toBeNull();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "USER_RESTORE" })
      );
    });
  });
});
