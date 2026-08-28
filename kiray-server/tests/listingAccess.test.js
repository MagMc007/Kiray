import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import {
  requireOwnerOrAdmin,
  requireAdmin,
  loadListing,
} from "../src/middleware/listingAccess.js";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "../src/utils/errors/index.js";

const mockListing = {
  _id: "507f191e810c19729de860eb",
  ownerId: "507f191e810c19729de860ea",
  isDeleted: false,
};

const ownerUser = {
  _id: "507f191e810c19729de860ea",
  role: "landlord",
};

const adminUser = {
  _id: "507f191e810c19729de860ab",
  role: "admin",
};

const otherUser = {
  _id: "507f191e810c19729de860ac",
  role: "rentee",
};

describe("listingAccess middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows the listing owner", () => {
    expect(() => requireOwnerOrAdmin(mockListing, ownerUser)).not.toThrow();
  });

  it("allows an admin user", () => {
    expect(() => requireOwnerOrAdmin(mockListing, adminUser)).not.toThrow();
  });

  it("rejects a non-owner non-admin user", () => {
    expect(() => requireOwnerOrAdmin(mockListing, otherUser)).toThrow(
      ForbiddenError,
    );
  });

  it("rejects when no user is present", () => {
    expect(() => requireOwnerOrAdmin(mockListing, null)).toThrow(
      UnauthorizedError,
    );
  });

  it("rejects when the listing does not exist", () => {
    expect(() => requireOwnerOrAdmin(null, ownerUser)).toThrow(NotFoundError);
  });

  it("allows admin via requireAdmin", () => {
    expect(() => requireAdmin(adminUser)).not.toThrow();
  });

  it("rejects non-admin via requireAdmin", () => {
    expect(() => requireAdmin(otherUser)).toThrow(ForbiddenError);
  });

  it("loads a listing by object ID and attaches it to req.listing", async () => {
    const req = { params: { id: "507f191e810c19729de860eb" } };
    const res = {};
    const next = jest.fn();

    const findOneMock = jest
      .fn()
      .mockReturnValue({ populate: jest.fn().mockResolvedValue(mockListing) });
    Listing.findOne = findOneMock;

    await loadListing(req, res, next, req.params.id);

    expect(findOneMock).toHaveBeenCalledWith({
      _id: req.params.id,
      isDeleted: false,
    });
    expect(req.listing).toBe(mockListing);
    expect(next).toHaveBeenCalled();
  });

  it("loads a listing by slug and attaches it to req.listing", async () => {
    const req = { params: { id: "sunny-apartment" } };
    const res = {};
    const next = jest.fn();

    const findOneMock = jest
      .fn()
      .mockReturnValue({ populate: jest.fn().mockResolvedValue(mockListing) });
    Listing.findOne = findOneMock;

    await loadListing(req, res, next, req.params.id);

    expect(findOneMock).toHaveBeenCalledWith({
      slug: "sunny-apartment",
      isDeleted: false,
    });
    expect(req.listing).toBe(mockListing);
    expect(next).toHaveBeenCalled();
  });

  it("calls next with NotFoundError when the listing does not exist", async () => {
    const req = { params: { id: "missing-id" } };
    const res = {};
    const next = jest.fn();

    const findOneMock = jest
      .fn()
      .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    Listing.findOne = findOneMock;

    await loadListing(req, res, next, req.params.id);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
  });
});
