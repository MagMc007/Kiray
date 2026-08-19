import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import {
  searchListings,
  getSimilarListings,
} from "../src/services/listingService.js";
import { NotFoundError } from "../src/utils/errors/index.js";

const makeQuery = (leanResult = []) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(leanResult),
});

const sourceListing = {
  _id: "507f191e810c19729de860eb",
  title: "Source apartment",
  price: 1200,
  propertyType: "apartment",
  location: { type: "Point", coordinates: [-74.006, 40.7128] },
};

describe("listing search", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("matches keyword search via the text index", async () => {
    const mockQuery = makeQuery();
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    await searchListings({ q: "apartment", page: 1, limit: 10 });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isDeleted: false,
        status: "open",
        $text: { $search: "apartment" },
      }),
    );
  });

  it("combines multiple filters with AND logic", async () => {
    const mockQuery = makeQuery();
    const findMock = jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    await searchListings({
      q: "sunny",
      city: "Addis Ababa",
      minPrice: 500,
      maxPrice: 3000,
      bedrooms_min: 2,
      bedrooms_max: 3,
      propertyType: "apartment",
      amenities: "wifi,parking",
      status: "open",
      page: 1,
      limit: 10,
    });

    const filter = findMock.mock.calls[0][0];

    expect(filter).toEqual(
      expect.objectContaining({
        $text: { $search: "sunny" },
        price: { $gte: 500, $lte: 3000 },
        bedrooms: { $gte: 2, $lte: 3 },
        propertyType: "apartment",
        amenities: { $all: ["wifi", "parking"] },
        status: "open",
        isDeleted: false,
      }),
    );
    expect(filter["address.city"]).toEqual({
      $regex: new RegExp("Addis Ababa", "i"),
    });
  });

  it("applies the mapped sort options", async () => {
    const mockQuery = makeQuery();
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    await searchListings({ sort: "price_desc", page: 1, limit: 10 });
    expect(mockQuery.sort).toHaveBeenCalledWith({ price: -1 });

    mockQuery.sort.mockClear();

    await searchListings({ sort: "newest", page: 1, limit: 10 });
    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("never returns soft-deleted listings in search results", async () => {
    const mockQuery = makeQuery();
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    await searchListings({ page: 1, limit: 10 });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({ isDeleted: false }),
    );
  });
});

describe("similar listings", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("excludes the source listing and soft-deleted listings", async () => {
    const mockQuery = makeQuery([
      {
        _id: "507f191e810c19729de860ec",
        title: "Similar apartment",
        price: 1100,
        propertyType: "apartment",
        status: "open",
        location: { type: "Point", coordinates: [-74.0, 40.71] },
      },
    ]);
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);

    const result = await getSimilarListings(sourceListing, {
      page: 1,
      limit: 10,
    });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isDeleted: false,
        status: "open",
        _id: { $ne: sourceListing._id },
        propertyType: "apartment",
        price: { $gte: 900, $lte: 1500 },
      }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]._id).not.toBe(sourceListing._id);
    expect(result.results[0].distance).toBeGreaterThanOrEqual(0);
    expect(result.meta.total).toBe(1);
  });

  it("matches on the same property type and price band", async () => {
    const mockQuery = makeQuery([]);
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(0);

    const rentHouse = {
      _id: "507f191e810c19729de860ed",
      title: "House",
      price: 4000,
      propertyType: "house",
    };

    await getSimilarListings(rentHouse, { page: 1, limit: 10 });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: "house",
        price: { $gte: 3000, $lte: 5000 },
        _id: { $ne: rentHouse._id },
      }),
    );
  });

  it("throws NotFoundError when the source listing is missing", async () => {
    await expect(getSimilarListings(null)).rejects.toThrow(NotFoundError);
  });
});