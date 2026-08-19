import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { incrementViewCount } from "../src/services/listingService.js";
import { NotFoundError } from "../src/utils/errors/index.js";

describe("listing view tracking", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("increments the view count on a public view", async () => {
    const listing = {
      _id: "listing-1",
      ownerId: "owner-1",
      viewCount: 0,
      save: jest.fn().mockResolvedValue(),
    };

    const updated = await incrementViewCount(listing);

    expect(updated.viewCount).toBe(1);
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("increments for a non-owner viewer", async () => {
    const listing = {
      _id: "listing-1",
      ownerId: "owner-1",
      viewCount: 0,
      save: jest.fn().mockResolvedValue(),
    };

    const updated = await incrementViewCount(listing, "viewer-1");

    expect(updated.viewCount).toBe(1);
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("does not increment for a soft-deleted listing", async () => {
    const listing = {
      _id: "listing-1",
      ownerId: "owner-1",
      isDeleted: true,
      viewCount: 0,
      save: jest.fn(),
    };

    await expect(incrementViewCount(listing)).rejects.toThrow(NotFoundError);
    expect(listing.save).not.toHaveBeenCalled();
  });

  it("does not inflate the count when the owner views their own listing", async () => {
    const listing = {
      _id: "listing-1",
      ownerId: "owner-1",
      viewCount: 0,
      save: jest.fn(),
    };

    const updated = await incrementViewCount(listing, "owner-1");

    expect(updated.viewCount).toBe(0);
    expect(listing.save).not.toHaveBeenCalled();
  });
});