import { describe, it, expect } from "@jest/globals";
import Listing from "../src/models/Listing.js";

describe("Listing model", () => {
  it("validates required listing fields and applies sensible defaults", () => {
    const listing = new Listing({
      ownerId: "507f191e810c19729de860ea",
      title: "Sunny apartment",
      slug: "sunny-apartment",
      description: "Bright two-bedroom apartment in a quiet neighborhood",
      price: 1200,
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 1,
      location: {
        type: "Point",
        coordinates: [40.7128, -74.006],
      },
      address: {
        street: "Main Street",
        city: "New York",
      },
    });

    const validationError = listing.validateSync();

    expect(validationError).toBeUndefined();
    expect(listing.status).toBe("open");
    expect(listing.currency).toBe("ETB");
    expect(listing.averageRating).toBe(0);
    expect(listing.totalComments).toBe(0);
    expect(listing.isDeleted).toBe(false);
  });

  it("defines the slug as unique and registers the geospatial index", () => {
    expect(Listing.schema.path("slug").options.unique).toBe(true);

    const hasGeoIndex = Listing.schema.indexes().some((index) => {
      return JSON.stringify(index).includes('"location":"2dsphere"');
    });

    expect(hasGeoIndex).toBe(true);
  });
});
