import { z } from "zod";

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  maxPrice: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  minBedrooms: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  maxBedrooms: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  bathrooms: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  propertyType: z.string().optional(),
  amenities: z.string().optional(), // comma-separated
  minArea: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  maxArea: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  status: z.enum(["open", "rented", "unavailable"]).optional(),
  lat: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  lng: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  radius: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().optional(),
  ),
  page: z.preprocess(
    (v) => (v ? Number(v) : 1),
    z.number().int().gte(1).optional(),
  ),
  limit: z.preprocess(
    (v) => (v ? Number(v) : 10),
    z.number().int().gte(1).optional(),
  ),
  sort: z.string().optional(),
});

export default listingSearchSchema;
