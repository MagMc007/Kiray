import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Favorite from "../src/models/Favorite.js";
import Listing from "../src/models/Listing.js";
import {
  saveListing,
  unsaveListing,
  getSavedListings,
} from "../src/services/favoriteService.js";
import { NotFoundError } from "../src/utils/errors/index.js";

const userId = "507f191e810c19729de860ea";
const listingId = "507f191e810c19729de860eb";

describe("favorite service", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("saves a new listing and increments saveCount", async () => {
    const favorite = { _id: "favorite-1", userId, listingId };
    jest.spyOn(Favorite, "findOne").mockResolvedValue(null);
    const createMock = jest.spyOn(Favorite, "create").mockResolvedValue(favorite);
    const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

    const result = await saveListing(userId, listingId);

    expect(createMock).toHaveBeenCalledWith({ userId, listingId });
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: listingId },
      { $inc: { saveCount: 1 } },
    );
    expect(result).toBe(favorite);
  });

  it("treats a duplicate save as a no-op", async () => {
    const existing = { _id: "favorite-1", userId, listingId };
    jest.spyOn(Favorite, "findOne").mockResolvedValue(existing);
    const createMock = jest.spyOn(Favorite, "create");
    const updateOneMock = jest.spyOn(Listing, "updateOne");

    const result = await saveListing(userId, listingId);

    expect(createMock).not.toHaveBeenCalled();
    expect(updateOneMock).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  it("unsaves a listing and decrements saveCount", async () => {
    const favorite = { _id: "favorite-1", userId, listingId };
    jest
      .spyOn(Favorite, "findOneAndDelete")
      .mockResolvedValue(favorite);
    const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

    const result = await unsaveListing(userId, listingId);

    expect(Favorite.findOneAndDelete).toHaveBeenCalledWith({
      userId,
      listingId,
    });
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: listingId, saveCount: { $gt: 0 } },
      { $inc: { saveCount: -1 } },
    );
    expect(result).toBe(favorite);
  });

  it("throws NotFoundError when unsaving a listing that was never saved", async () => {
    jest.spyOn(Favorite, "findOneAndDelete").mockResolvedValue(null);
    const updateOneMock = jest.spyOn(Listing, "updateOne");

    await expect(unsaveListing(userId, listingId)).rejects.toThrow(
      NotFoundError,
    );
    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("paginates saved listings and drops soft-deleted listings", async () => {
    jest.spyOn(Favorite, "countDocuments").mockResolvedValue(2);
    const favoriteQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        { _id: "favorite-1", userId, listingId: "listing-1" },
        { _id: "favorite-2", userId, listingId: "listing-2" },
      ]),
    };
    jest.spyOn(Favorite, "find").mockReturnValue(favoriteQuery);

    const listingLean = jest.fn().mockResolvedValue([
      { _id: "listing-1", title: "Sunny apartment", isDeleted: false },
    ]);
    jest.spyOn(Listing, "find").mockReturnValue({ lean: listingLean });

    const result = await getSavedListings(userId, { page: 1, limit: 20 });

    expect(Listing.find).toHaveBeenCalledWith({
      _id: { $in: ["listing-1", "listing-2"] },
      isDeleted: false,
    });
    expect(result.results).toEqual([
      { _id: "listing-1", title: "Sunny apartment", isDeleted: false },
    ]);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 2 });
  });
});