import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import {
  markAsStatus,
  searchListings,
} from "../src/services/listingService.js";
import { requireOwnerOrAdmin } from "../src/middleware/listingAccess.js";
import {
  NotFoundError,
  UnauthorizedError,
} from "../src/utils/errors/index.js";

const ownerUser = { _id: "507f191e810c19729de860ea", role: "landlord" };
const adminUser = { _id: "507f191e810c19729de860ab", role: "admin" };
const otherUser = { _id: "507f191e810c19729de860ac", role: "rentee" };

describe("listing status service", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("marks a listing as open (available)", async () => {
    const listing = { status: "rented", save: jest.fn().mockResolvedValue() };

    const updated = await markAsStatus(listing, "open");

    expect(updated.status).toBe("open");
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("marks a listing as rented", async () => {
    const listing = { status: "open", save: jest.fn().mockResolvedValue() };

    const updated = await markAsStatus(listing, "rented");

    expect(updated.status).toBe("rented");
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("marks a listing as unavailable", async () => {
    const listing = { status: "open", save: jest.fn().mockResolvedValue() };

    const updated = await markAsStatus(listing, "unavailable");

    expect(updated.status).toBe("unavailable");
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("throws NotFoundError when the listing is missing", async () => {
    await expect(markAsStatus(null, "rented")).rejects.toThrow(NotFoundError);
  });
});

describe("status and discovery", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("excludes rented and unavailable listings from default search results", async () => {
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    await searchListings({ page: 1, limit: 10 });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({ isDeleted: false, status: "open" }),
    );
  });
});

describe("status ownership", () => {
  const listing = {
    _id: "507f191e810c19729de860eb",
    ownerId: ownerUser._id,
  };

  it("lets the owner change the status", () => {
    expect(() => requireOwnerOrAdmin(listing, ownerUser)).not.toThrow();
  });

  it("lets an admin change status on any listing", () => {
    expect(() => requireOwnerOrAdmin(listing, adminUser)).not.toThrow();
  });

  it("blocks a non-owner from changing the status", () => {
    expect(() => requireOwnerOrAdmin(listing, otherUser)).toThrow(
      UnauthorizedError,
    );
  });

  it("blocks an unauthenticated status change", () => {
    expect(() => requireOwnerOrAdmin(listing, null)).toThrow(
      UnauthorizedError,
    );
  });
});