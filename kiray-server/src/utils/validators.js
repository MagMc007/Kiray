import { z } from "zod";

export const syncSchema = z.object({
  role: z.enum(["landlord", "rentee", "admin"], {
    required_error: "Role is required",
    invalid_enum_value: "Role must be one of: landlord, rentee, admin",
  }),
});

export const createListingSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .max(2000, "Description cannot exceed 2000 characters"),
  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be non-negative"),
  currency: z.string().default("ETB"),
  propertyType: z.enum(
    ["apartment", "house", "studio", "room", "villa", "condo", "other"],
    {
      required_error: "Property type is required",
      invalid_enum_value: "Invalid property type",
    }
  ),
  bedrooms: z
    .number({ required_error: "Bedrooms count is required" })
    .min(0, "Bedrooms must be non-negative"),
  bathrooms: z
    .number({ required_error: "Bathrooms count is required" })
    .min(0, "Bathrooms must be non-negative"),
  area: z
    .number()
    .min(0, "Area must be non-negative")
    .optional(),
  areaUnit: z.enum(["sqm", "sqft"]).default("sqm"),
  amenities: z
    .array(
      z.enum([
        "wifi",
        "parking",
        "ac",
        "heating",
        "furnished",
        "unfurnished",
        "washer",
        "dryer",
        "balcony",
        "garden",
        "pool",
        "gym",
        "pet_friendly",
        "security",
        "elevator",
        "water_included",
        "electricity_included",
        "gas_included",
      ])
    )
    .optional()
    .default([]),
  location: z.object(
    {
      type: z.literal("Point").default("Point"),
      coordinates: z
        .array(z.number())
        .length(2, "Coordinates must have exactly [longitude, latitude]"),
    },
    { required_error: "Location is required" }
  ),
  address: z.object(
    {
      street: z.string({ required_error: "Street is required" }).trim(),
      city: z.string({ required_error: "City is required" }).trim(),
      neighborhood: z.string().trim().optional(),
      postalCode: z.string().trim().optional(),
    },
    { required_error: "Address is required" }
  ),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        publicId: z.string({ required_error: "Image publicId is required" }),
        order: z.number().default(0),
      })
    )
    .optional()
    .default([]),
  status: z.enum(["open", "rented", "unavailable"]).default("open"),
  availableFrom: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
  availableUntil: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
});

export const updateListingSchema = z.object({
  title: z.string().trim().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  propertyType: z.enum(["apartment", "house", "studio", "room", "villa", "condo", "other"]).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(0).optional(),
  areaUnit: z.enum(["sqm", "sqft"]).optional(),
  amenities: z
    .array(
      z.enum([
        "wifi",
        "parking",
        "ac",
        "heating",
        "furnished",
        "unfurnished",
        "washer",
        "dryer",
        "balcony",
        "garden",
        "pool",
        "gym",
        "pet_friendly",
        "security",
        "elevator",
        "water_included",
        "electricity_included",
        "gas_included",
      ])
    )
    .optional(),
  location: z
    .object({
      type: z.literal("Point").default("Point").optional(),
      coordinates: z.array(z.number()).length(2).optional(),
    })
    .optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      neighborhood: z.string().trim().optional(),
      postalCode: z.string().trim().optional(),
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url().optional(),
        publicId: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
  status: z.enum(["open", "rented", "unavailable"]).optional(),
  availableFrom: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
  availableUntil: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
});

