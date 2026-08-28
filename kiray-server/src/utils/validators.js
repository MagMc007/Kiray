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
  status: z.enum(["open", "rented", "unavailable"]).optional(),
  availableFrom: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
  availableUntil: z
    .preprocess((v) => (v ? new Date(v) : null), z.date().nullable().optional()),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["open", "rented", "unavailable"], {
    required_error: "Status is required",
    invalid_enum_value: "Status must be one of: open, rented, unavailable",
  }),
});

export const createCommentSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  text: z
    .string({ required_error: "Text is required" })
    .trim()
    .min(1, "Comment text cannot be empty")
    .max(1000, "Comment text cannot exceed 1000 characters"),
  verifiedRentee: z.boolean().optional().default(false),
});

export const updateCommentSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional(),
  text: z
    .string()
    .trim()
    .min(1, "Comment text cannot be empty")
    .max(1000, "Comment text cannot exceed 1000 characters")
    .optional(),
  verifiedRentee: z.boolean().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "banned"], {
    required_error: "Status is required",
    invalid_enum_value: "Status must be one of: active, suspended, banned",
  }),
  reason: z.string().trim().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["landlord", "rentee", "admin"], {
    required_error: "Role is required",
    invalid_enum_value: "Role must be one of: landlord, rentee, admin",
  }),
});

export const adminListingOverrideSchema = z.object({
  title: z.string().trim().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  propertyType: z
    .enum(["apartment", "house", "studio", "room", "villa", "condo", "other"])
    .optional(),
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
  status: z.enum(["open", "rented", "unavailable"]).optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFlagged: z.boolean().optional(),
  flagReason: z.string().nullable().optional(),
});

export const resolveFlagsSchema = z.object({
  notes: z.string().trim().optional(),
  action: z.enum(["dismiss", "deactivate", "restore"]).optional().default("dismiss"),
});

export const updateSystemConfigSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  allowNewSignups: z.boolean().optional(),
  maxListingsPerLandlord: z.number().min(1).optional(),
});

export const purgeSoftDeletedSchema = z.object({
  daysOld: z.number().min(1).optional().default(30),
  target: z.enum(["listings", "users", "all"]).optional().default("all"),
});





