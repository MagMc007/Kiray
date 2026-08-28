import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const removeListingImageMock = jest.fn().mockResolvedValue({ result: "ok" });

jest.unstable_mockModule("../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

jest.unstable_mockModule("../src/services/listingImageService.js", () => ({
  removeListingImage: removeListingImageMock,
  uploadListingImages: jest.fn(),
}));

const User = (await import("../src/models/User.js")).default;
const Listing = (await import("../src/models/Listing.js")).default;
const Report = (await import("../src/models/Report.js")).default;
const AuditLog = (await import("../src/models/AuditLog.js")).default;
const adminAuditService = await import("../src/services/adminAuditService.js");
const adminMaintenanceService = await import("../src/services/adminMaintenanceService.js");
const { NotFoundError } = await import("../src/utils/errors/index.js");

const mockAdminUser = {
  _id: "507f191e810c19729de860aa",
  role: "admin",
  displayName: "System Admin",
};

const mockTargetUser = {
  _id: "507f191e810c19729de860bb",
  displayName: "Alice Smith",
  email: "alice@example.com",
};

describe("Module 5: Audit Log & Security Compliance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);
  });

  describe("listAuditLogs", () => {
    it("returns paginated audit logs with filter parameters", async () => {
      const mockLogs = [
        {
          _id: "log_1",
          action: "USER_SUSPEND",
          targetType: "User",
          adminId: { displayName: "Admin" },
        },
      ];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs),
      };

      jest.spyOn(AuditLog, "find").mockReturnValue(mockQuery);
      jest.spyOn(AuditLog, "countDocuments").mockResolvedValue(1);

      const result = await adminAuditService.listAuditLogs({
        page: 1,
        limit: 10,
        action: "USER_SUSPEND",
      });

      expect(result.logs).toEqual(mockLogs);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe("getAuditLogDetail", () => {
    it("returns detailed audit log entry", async () => {
      const mockLog = { _id: "log_1", action: "USER_BAN" };
      jest.spyOn(AuditLog, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockLog),
        }),
      });

      const result = await adminAuditService.getAuditLogDetail("log_1");
      expect(result).toEqual(mockLog);
    });

    it("throws NotFoundError if audit log is missing", async () => {
      jest.spyOn(AuditLog, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        adminAuditService.getAuditLogDetail("missing_id")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("exportUserData", () => {
    it("exports complete user data dump for compliance", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTargetUser),
      });

      const mockListings = [{ _id: "l1", title: "Apt" }];
      const mockReports = [{ _id: "r1", reason: "Spam" }];
      const mockHistory = [{ _id: "h1", action: "USER_STATUS_UPDATE" }];

      jest.spyOn(Listing, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockListings),
      });
      jest.spyOn(Report, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockReports),
      });
      jest.spyOn(AuditLog, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockHistory),
      });

      const result = await adminAuditService.exportUserData(mockTargetUser._id);

      expect(result.user).toEqual(mockTargetUser);
      expect(result.listings).toEqual(mockListings);
      expect(result.reportsSubmitted).toEqual(mockReports);
      expect(result.auditHistory).toEqual(mockHistory);
    });
  });
});

describe("Module 6: System Configuration & Admin Maintenance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);
  });

  describe("getSystemHealth", () => {
    it("returns system health diagnostics and memory stats", async () => {
      const health = await adminMaintenanceService.getSystemHealth();

      expect(health.status).toBeDefined();
      expect(health.database.status).toBeDefined();
      expect(health.system.nodeVersion).toBe(process.version);
      expect(health.system.memoryUsage.heapUsedMB).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getSystemConfig & updateSystemConfig", () => {
    it("gets current config and updates config settings", async () => {
      const initialConfig = await adminMaintenanceService.getSystemConfig();
      expect(initialConfig).toBeDefined();

      const updated = await adminMaintenanceService.updateSystemConfig(
        mockAdminUser,
        { maintenanceMode: true }
      );

      expect(updated.maintenanceMode).toBe(true);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "SYSTEM_CONFIG_UPDATE" })
      );
    });
  });

  describe("purgeSoftDeleted", () => {
    it("purges soft-deleted records older than specified threshold", async () => {
      const expiredListing = {
        _id: "l_expired",
        images: [{ publicId: "kiray/exp1" }],
      };
      jest.spyOn(Listing, "find").mockResolvedValue([expiredListing]);
      jest.spyOn(Listing, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      jest.spyOn(User, "deleteMany").mockResolvedValue({ deletedCount: 2 });

      const result = await adminMaintenanceService.purgeSoftDeleted(
        mockAdminUser,
        30,
        "all"
      );

      expect(result.purgedListings).toBe(1);
      expect(result.purgedUsers).toBe(2);
      expect(removeListingImageMock).toHaveBeenCalledWith("kiray/exp1");
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "SYSTEM_PURGE_SOFT_DELETED" })
      );
    });
  });
});
