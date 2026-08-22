import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import {
  searchNearbyListings,
  getSimilarListings,
} from "../src/services/listingService.js";
import { NotFoundError, ValidationError } from "../src/utils/errors/index.js";

const EARTH_RADIUS_METERS = 6378137;

const makeQuery = (leanResult = []) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(leanResult),
});

describe("listing geo search", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns nearby listings with distance metadata within the radius", async () => {
    const mockQuery = makeQuery([
      {
        _id: "1",
        title: "Central apartment",
        location: {
          type: "Point",
          coordinates: [-74.006, 40.7128],
        },
      },
    ]);

    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);

    const result = await searchNearbyListings({
      lat: 40.7128,
      lng: -74.006,
      radius: 5000,
      page: 1,
      limit: 10,
    });

    expect(result.meta.page).toBe(1);
    expect(result.results[0].distance).toBeGreaterThanOrEqual(0);
    expect(result.results[0].distance).toBeLessThanOrEqual(5000);
  });

  it("uses the correct radius for $maxDistance and $geoWithin count", async () => {
    const mockQuery = makeQuery([]);
    const findMock = jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    const countMock = jest
      .spyOn(Listing, "countDocuments")
      .mockResolvedValue(0);

    await searchNearbyListings({
      lat: 9.03,
      lng: 38.7578,
      radius: 3000,
      page: 1,
      limit: 10,
    });

    const findFilter = findMock.mock.calls[0][0];
    expect(findFilter.location.$nearSphere.$maxDistance).toBe(3000);
    expect(findFilter.location.$nearSphere.$geometry).toEqual({
      type: "Point",
      coordinates: [38.7578, 9.03],
    });

    const countFilter = countMock.mock.calls[0][0];
    expect(countFilter.location.$geoWithin.$centerSphere).toEqual([
      [38.7578, 9.03],
      3000 / EARTH_RADIUS_METERS,
    ]);
  });

  it("throws ValidationError when lat or lng is missing", async () => {
    await expect(searchNearbyListings({ lng: 38.75 })).rejects.toThrow(
      ValidationError,
    );
    await expect(searchNearbyListings({ lat: 9.03 })).rejects.toThrow(
      ValidationError,
    );
    await expect(searchNearbyListings({})).rejects.toThrow(ValidationError);
  });

  it("returns distance null and sorts by newest when source has no coordinates", async () => {
    const listingWithoutCoords = {
      _id: "507f191e810c19729de860ef",
      title: "No-location listing",
      price: 1200,
      propertyType: "apartment",
    };

    const mockQuery = makeQuery([
      {
        _id: "507f191e810c19729de860f0",
        title: "Result listing",
        price: 1100,
        propertyType: "apartment",
        status: "open",
      },
    ]);
    jest.spyOn(Listing, "find").mockReturnValue(mockQuery);
    jest.spyOn(Listing, "countDocuments").mockResolvedValue(1);

    const result = await getSimilarListings(listingWithoutCoords, {
      page: 1,
      limit: 10,
    });

    expect(Listing.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isDeleted: false,
        status: "open",
        _id: { $ne: listingWithoutCoords._id },
        propertyType: "apartment",
      }),
    );

    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result.results[0].distance).toBeNull();
  });
});
