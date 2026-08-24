import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { flagListing } from "../src/services/listingService.js";
import { NotFoundError, ValidationError } from "../src/utils/errors/index.js";

describe("flagListing service logic", () => {
  let mockListing;

  beforeEach(() => {
    mockListing = {
      _id: "507f191e810c19729de860ea",
      ownerId: "60d0fe4f5311236168a109c9",
      title: "Spacious Villa",
      status: "open",
      isDeleted: false,
      isFlagged: false,
      flagReason: null,
      flagCount: 0,
      save: jest.fn().mockResolvedValue(true),
    };
  });

  it("flags an active listing successfully", async () => {
    const result = await flagListing(mockListing, "Suspicious details");

    expect(result.isFlagged).toBe(true);
    expect(result.flagReason).toBe("Suspicious details");
    expect(result.flagCount).toBe(1);
    expect(result.status).toBe("open");
    expect(mockListing.save).toHaveBeenCalled();
  });

  it("throws ValidationError when trying to flag a non-active listing", async () => {
    mockListing.status = "rented";

    await expect(flagListing(mockListing, "Some reason")).rejects.toThrow(
      ValidationError,
    );
    expect(mockListing.save).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when trying to flag a deleted listing or null", async () => {
    mockListing.isDeleted = true;

    await expect(flagListing(mockListing, "Some reason")).rejects.toThrow(
      NotFoundError,
    );
    await expect(flagListing(null, "Some reason")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("automatically deactivates listing and notifies owner upon reaching 10 flags", async () => {
    mockListing.flagCount = 9;

    const result = await flagListing(mockListing, "Fraudulent listing");

    expect(result.flagCount).toBe(10);
    expect(result.status).toBe("unavailable");
    expect(result.deactivationReason).toBe("Fraudulent listing");
    expect(result.deactivationMessage).toContain(
      "Your listing 'Spacious Villa' has been automatically deactivated because it received 10 flags",
    );
    expect(mockListing.save).toHaveBeenCalled();
  });
});

describe("resolveFlaggedListing service logic", () => {
  it("clears flags and restores status to open if unavailable", async () => {
    const { resolveFlaggedListing } = await import(
      "../src/services/listingService.js"
    );

    const mockListing = {
      _id: "507f191e810c19729de860ea",
      title: "Flagged House",
      status: "unavailable",
      isFlagged: true,
      flagReason: "Inaccurate address",
      flagCount: 10,
      deactivationReason: "Inaccurate address",
      deactivationMessage: "Deactivated message",
      save: jest.fn().mockResolvedValue(true),
    };

    const result = await resolveFlaggedListing(mockListing);

    expect(result.isFlagged).toBe(false);
    expect(result.flagReason).toBeNull();
    expect(result.flagCount).toBe(0);
    expect(result.deactivationReason).toBeNull();
    expect(result.deactivationMessage).toBeNull();
    expect(result.status).toBe("open");
    expect(mockListing.save).toHaveBeenCalled();
  });

  it("throws NotFoundError if listing to resolve is null", async () => {
    const { resolveFlaggedListing } = await import(
      "../src/services/listingService.js"
    );

    await expect(resolveFlaggedListing(null)).rejects.toThrow(NotFoundError);
  });
});

