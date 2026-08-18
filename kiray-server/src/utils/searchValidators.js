import { z } from "zod";

const optionalNumber = (defaultValue) =>
  z.preprocess(
    (v) =>
      v === undefined || v === null || v === "" ? defaultValue : Number(v),
    z.number().optional(),
  );

export const listingSearchSchema = z
  .object({
    ownerId: z.string().optional(),
    q: z.string().optional(),
    city: z.string().optional(),
    minPrice: optionalNumber(undefined),
    maxPrice: optionalNumber(undefined),
    bedrooms: optionalNumber(undefined),
    bedrooms_min: optionalNumber(undefined),
    bedrooms_max: optionalNumber(undefined),
    minBedrooms: optionalNumber(undefined),
    maxBedrooms: optionalNumber(undefined),
    bathrooms: optionalNumber(undefined),
    propertyType: z.string().optional(),
    amenities: z.string().optional(), // comma-separated
    minArea: optionalNumber(undefined),
    maxArea: optionalNumber(undefined),
    status: z.enum(["open", "rented", "unavailable"]).optional(),
    lat: optionalNumber(undefined),
    lng: optionalNumber(undefined),
    radius: optionalNumber(undefined),
    page: z.preprocess(
      (v) => (v === undefined || v === "" ? 1 : Number(v)),
      z.number().int().gte(1).optional(),
    ),
    limit: z.preprocess(
      (v) => (v === undefined || v === "" ? 20 : Number(v)),
      z.number().int().gte(1).max(50).optional(),
    ),
    sort: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.q && (data.lat !== undefined || data.lng !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Text search (q) cannot be combined with location (lat/lng) filters",
        path: ["q"],
      });
    }
  });

export default listingSearchSchema;
