import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  incrementViewCount,
  incrementContactClick,
} from "../src/services/listingService.js";
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

describe("contact click tracking", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("increments the contact click count", async () => {
    const listing = {
      _id: "listing-1",
      isDeleted: false,
      contactClickCount: 2,
      save: jest.fn().mockResolvedValue(),
    };

    const updated = await incrementContactClick(listing);

    expect(updated.contactClickCount).toBe(3);
    expect(listing.save).toHaveBeenCalledTimes(1);
  });

  it("starts from zero when contactClickCount is undefined", async () => {
    const listing = {
      _id: "listing-1",
      isDeleted: false,
      save: jest.fn().mockResolvedValue(),
    };

    const updated = await incrementContactClick(listing);

    expect(updated.contactClickCount).toBe(1);
  });

  it("throws NotFoundError for a soft-deleted listing", async () => {
    const listing = {
      _id: "listing-1",
      isDeleted: true,
      contactClickCount: 0,
      save: jest.fn(),
    };

    await expect(incrementContactClick(listing)).rejects.toThrow(
      NotFoundError,
    );
    expect(listing.save).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when listing is null", async () => {
    await expect(incrementContactClick(null)).rejects.toThrow(NotFoundError);
  });
});