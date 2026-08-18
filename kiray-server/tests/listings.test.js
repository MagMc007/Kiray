import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import {
  createListing,
  updateListing,
  deleteListing,
  restoreListing,
  searchListings,
} from "../src/services/listingService.js";
import { NotFoundError } from "../src/utils/errors/index.js";

const ownerId = "507f191e810c19729de860ea";
const listingId = "507f191e810c19729de860eb";

const sampleData = {
  title: "Sunny apartment",
  description: "Bright two-bedroom apartment in a quiet neighborhood",
  price: 1200,
  propertyType: "apartment",
  bedrooms: 2,
  bathrooms: 1,
  location: { type: "Point", coordinates: [-74.006, 40.7128] },
  address: { street: "Main Street", city: "New York" },
};

describe("listing CRUD service", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a listing with a unique slug", async () => {
    const saveMock = jest
      .spyOn(Listing.prototype, "save")
      .mockResolvedValue();
    jest.spyOn(Listing, "findOne").mockResolvedValue(null);

    const listing = await createListing(sampleData, ownerId);

    expect(listing.slug).toBe("sunny-apartment");
    expect(listing.ownerId.toString()).toBe(ownerId);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("appends a counter suffix when the base slug is taken", async () => {
    jest.spyOn(Listing.prototype, "save").mockResolvedValue();
    jest
      .spyOn(Listing, "findOne")
      .mockResolvedValueOnce({ _id: "existing-listing" }) // first attempt taken
      .mockResolvedValue(null); // second attempt free

    const listing = await createListing(sampleData, ownerId);

    expect(listing.slug).toBe("sunny-apartment-1");
  });

  it("regenerates the slug when the title changes on update", async () => {
    const listing = {
      _id: listingId,
      title: "Old title",
      slug: "old-title",
      save: jest.fn().mockResolvedValue(),
    };
    jest.spyOn(Listing, "findOne").mockResolvedValue(null);

    const updated = await updateListing(listing, {
      title: "New title",
      price: 1500,
    });

    expect(updated.slug).toBe("new-title");
    expect(updated.price).toBe(1500);
    expect(updated.save).toHaveBeenCalledTimes(1);
  });

  it("never lets clients overwrite slug, ownerId or images on update", async () => {
    const listing = {
      _id: listingId,
      title: "Same title",
      slug: "same-title",
      ownerId,
      images: [{ url: "https://img/a.jpg", publicId: "a" }],
      save: jest.fn().mockResolvedValue(),
    };

    const updated = await updateListing(listing, {
      price: 100,
      slug: "hacked",
      ownerId: "507f191e810c19729de86099",
      images: [{ url: "https://img/x.jpg", publicId: "x" }],
    });

    expect(updated.slug).toBe("same-title");
    expect(updated.ownerId).toBe(ownerId);
    expect(updated.images).toEqual([
      { url: "https://img/a.jpg", publicId: "a" },
    ]);
    expect(updated.price).toBe(100);
  });

  it("soft-deletes a listing with isDeleted and deletedAt", async () => {
    const listing = {
      isDeleted: false,
      deletedAt: null,
      save: jest.fn().mockResolvedValue(),
    };

    const deleted = await deleteListing(listing);

    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("restores a soft-deleted listing", async () => {
    const listing = {
      isDeleted: true,
      deletedAt: new Date(),
      save: jest.fn().mockResolvedValue(),
    };

    const restored = await restoreListing(listing);

    expect(restored.isDeleted).toBe(false);
    expect(restored.deletedAt).toBeNull();
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("throws NotFoundError when restoring a missing listing", async () => {
    await expect(restoreListing(null)).rejects.toThrow(NotFoundError);
  });

  it("excludes soft-deleted listings from public search, defaulting to open", async () => {
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

    const result = await searchListings({ page: 1, limit: 10 });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({ isDeleted: false, status: "open" }),
    );
    expect(result.meta.total).toBe(0);
  });
});