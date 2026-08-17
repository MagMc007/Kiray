import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Listing from "../src/models/Listing.js";
import { searchNearbyListings } from "../src/services/listingService.js";

describe("listing geo search", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns nearby listings with distance metadata within the radius", async () => {
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: "1",
          title: "Central apartment",
          location: {
            type: "Point",
            coordinates: [-74.006, 40.7128],
          },
        },
      ]),
    };

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
});
