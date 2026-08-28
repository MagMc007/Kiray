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

const Listing = (await import("../src/models/Listing.js")).default;
const Report = (await import("../src/models/Report.js")).default;
const AuditLog = (await import("../src/models/AuditLog.js")).default;
const adminListingService = await import("../src/services/adminListingService.js");
const adminModerationService = await import("../src/services/adminModerationService.js");
const { NotFoundError } = await import("../src/utils/errors/index.js");

const mockAdminUser = {
  _id: "507f191e810c19729de860aa",
  role: "admin",
  displayName: "System Admin",
};

const mockListingDoc = {
  _id: "507f191e810c19729de860c1",
  title: "Spacious Studio",
  slug: "spacious-studio",
  status: "open",
  isVerified: false,
  isFeatured: false,
  isFlagged: true,
  flagReason: "Misleading pricing",
  deactivatedByAdmin: false,
  isDeleted: false,
  images: [{ url: "http://example.com/img.jpg", publicId: "kiray/img1" }],
  save: jest.fn().mockResolvedValue(true),
};

describe("Module 3: Listing Moderation & Override", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);
  });

  describe("listAdminListings", () => {
    it("returns paginated listings with filter criteria", async () => {
      const mockListings = [mockListingDoc];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockListings),
      };

      jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
      jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);

      const result = await adminListingService.listAdminListings({
        page: 1,
        limit: 10,
        isVerified: false,
        isFlagged: true,
      });

      expect(result.listings).toEqual(mockListings);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe("getAdminListingDetail", () => {
    it("returns listing with report history", async () => {
      jest.spyOn(Listing, "findOne").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockListingDoc),
        }),
      });

      const mockReports = [
        { _id: "report_1", reason: "Spam", reporterId: { displayName: "User A" } },
      ];
      jest.spyOn(Report, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockReports),
          }),
        }),
      });

      const result = await adminListingService.getAdminListingDetail(
        mockListingDoc._id
      );

      expect(result.listing).toEqual(mockListingDoc);
      expect(result.reports).toEqual(mockReports);
    });

    it("throws NotFoundError if listing missing", async () => {
      jest.spyOn(Listing, "findOne").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        adminListingService.getAdminListingDetail("507f191e810c19729de86000")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateListingOverride & Status", () => {
    it("overrides listing fields directly and writes audit log", async () => {
      const listing = {
        ...mockListingDoc,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.updateListingOverride(
        mockAdminUser,
        mockListingDoc._id,
        { price: 1500 }
      );

      expect(result.price).toBe(1500);
      expect(listing.save).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_ADMIN_OVERRIDE" })
      );
    });

    it("updates listing status directly and writes audit log", async () => {
      const listing = {
        ...mockListingDoc,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.updateListingStatus(
        mockAdminUser,
        mockListingDoc._id,
        "rented"
      );

      expect(result.status).toBe("rented");
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_STATUS_RENTED" })
      );
    });
  });

  describe("toggleVerifyListing & toggleFeatureListing", () => {
    it("toggles verification status", async () => {
      const listing = {
        ...mockListingDoc,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.toggleVerifyListing(
        mockAdminUser,
        mockListingDoc._id,
        true
      );

      expect(result.isVerified).toBe(true);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_VERIFY" })
      );
    });

    it("toggles featured status", async () => {
      const listing = {
        ...mockListingDoc,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.toggleFeatureListing(
        mockAdminUser,
        mockListingDoc._id,
        true
      );

      expect(result.isFeatured).toBe(true);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_FEATURE" })
      );
    });
  });

  describe("deactivateListing, restoreListing & hardDeleteListing", () => {
    it("deactivates listing with administrative takedown", async () => {
      const listing = {
        ...mockListingDoc,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.deactivateListing(
        mockAdminUser,
        mockListingDoc._id,
        "Violation of safety terms"
      );

      expect(result.deactivatedByAdmin).toBe(true);
      expect(result.status).toBe("unavailable");
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_DEACTIVATE" })
      );
    });

    it("restores soft-deleted or deactivated listing", async () => {
      const listing = {
        ...mockListingDoc,
        isDeleted: true,
        deactivatedByAdmin: true,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);

      const result = await adminListingService.restoreListing(
        mockAdminUser,
        mockListingDoc._id
      );

      expect(result.isDeleted).toBe(false);
      expect(result.deactivatedByAdmin).toBe(false);
      expect(result.status).toBe("open");
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_RESTORE" })
      );
    });

    it("hard deletes listing permanently and cleans up Cloudinary assets", async () => {
      const listing = { ...mockListingDoc };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Listing, "deleteOne").mockResolvedValue({ deletedCount: 1 });

      const result = await adminListingService.hardDeleteListing(
        mockAdminUser,
        mockListingDoc._id
      );

      expect(result.deleted).toBe(true);
      expect(removeListingImageMock).toHaveBeenCalledWith("kiray/img1");
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "LISTING_HARD_DELETE" })
      );
    });
  });
});

describe("Module 4: Flag & Moderation Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditLog, "create").mockImplementation(async (data) => data);
  });

  describe("getFlaggedListings", () => {
    it("returns flagged listings with report counts", async () => {
      const mockListings = [mockListingDoc];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockListings),
      };

      jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
      jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Report, "aggregate").mockResolvedValue([
        { _id: mockListingDoc._id, count: 2 },
      ]);

      const result = await adminModerationService.getFlaggedListings({
        page: 1,
        limit: 10,
      });

      expect(result.listings[0].pendingReportCount).toBe(2);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe("getListingReports", () => {
    it("returns reports for a listing", async () => {
      jest.spyOn(Listing, "findOne").mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockListingDoc),
        }),
      });

      const mockReports = [{ _id: "r1", reason: "Fraud" }];
      jest.spyOn(Report, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockReports),
          }),
        }),
      });

      const result = await adminModerationService.getListingReports(
        mockListingDoc._id
      );

      expect(result.listing).toEqual(mockListingDoc);
      expect(result.reports).toEqual(mockReports);
    });
  });

  describe("resolveListingFlags", () => {
    it("dismisses listing flags and updates pending reports", async () => {
      const listing = {
        ...mockListingDoc,
        isFlagged: true,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Report, "updateMany").mockResolvedValue({ modifiedCount: 2 });

      const result = await adminModerationService.resolveListingFlags(
        mockAdminUser,
        mockListingDoc._id,
        "Verified details are accurate",
        "dismiss"
      );

      expect(result.isFlagged).toBe(false);
      expect(result.flagReason).toBeNull();
      expect(Report.updateMany).toHaveBeenCalledWith(
        { listingId: listing._id, status: "pending" },
        expect.objectContaining({ status: "dismissed" })
      );
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: "FLAG_RESOLVE_DISMISS" })
      );
    });

    it("deactivates listing when action is deactivate during resolution", async () => {
      const listing = {
        ...mockListingDoc,
        isFlagged: true,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Report, "updateMany").mockResolvedValue({ modifiedCount: 1 });

      const result = await adminModerationService.resolveListingFlags(
        mockAdminUser,
        mockListingDoc._id,
        "Found violating content",
        "deactivate"
      );

      expect(result.isFlagged).toBe(false);
      expect(result.deactivatedByAdmin).toBe(true);
      expect(result.status).toBe("unavailable");
      expect(Report.updateMany).toHaveBeenCalledWith(
        { listingId: listing._id, status: "pending" },
        expect.objectContaining({ status: "actioned" })
      );
    });
  });
});
