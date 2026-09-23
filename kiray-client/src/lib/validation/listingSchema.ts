import { z } from 'zod';
import type { Amenity, PropertyType, ListingStatus } from '@/types/listing';

export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'studio',
  'room',
  'villa',
  'condo',
  'other',
] as const;

export const AMENITIES_LIST = [
  'wifi',
  'parking',
  'ac',
  'heating',
  'furnished',
  'unfurnished',
  'washer',
  'dryer',
  'balcony',
  'garden',
  'pool',
  'gym',
  'pet_friendly',
  'security',
  'elevator',
  'water_included',
  'electricity_included',
  'gas_included',
] as const;

export const LISTING_STATUSES = [
  'open',
  'rented',
  'unavailable',
] as const;

export const IMAGE_CONSTRAINTS = {
  MIN_IMAGES: 2,
  MAX_IMAGES: 6,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
};

export const createListingSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .min(1, 'Price must be greater than 0'),
  currency: z.string().default('ETB'),
  propertyType: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: 'Property type is required' }),
  }),
  bedrooms: z
    .number({ required_error: 'Bedrooms is required', invalid_type_error: 'Bedrooms must be a number' })
    .min(0, 'Bedrooms must be non-negative'),
  bathrooms: z
    .number({ required_error: 'Bathrooms is required', invalid_type_error: 'Bathrooms must be a number' })
    .min(0, 'Bathrooms must be non-negative'),
  area: z
    .number({ required_error: 'Area is required', invalid_type_error: 'Area must be a number' })
    .min(1, 'Area must be greater than 0'),
  areaUnit: z.enum(['sqm', 'sqft']).default('sqm'),
  amenities: z
    .array(z.enum(AMENITIES_LIST))
    .min(1, 'Please select at least one amenity'),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z
      .array(z.number())
      .length(2, 'Coordinates must have exactly [longitude, latitude]'),
  }),
  address: z.object({
    street: z.string().trim().min(1, 'Street is required'),
    city: z.string().trim().min(1, 'City is required'),
    neighborhood: z.string().trim().min(1, 'Neighborhood is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
  }),
  status: z.enum(LISTING_STATUSES).default('open'),
  availableFrom: z
    .preprocess((v) => (v ? new Date(v as string | Date) : null), z.date().nullable().optional()),
  availableUntil: z
    .preprocess((v) => (v ? new Date(v as string | Date) : null), z.date().nullable().optional()),
});

export const updateListingSchema = z.object({
  title: z.string().trim().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(0).optional(),
  areaUnit: z.enum(['sqm', 'sqft']).optional(),
  amenities: z.array(z.enum(AMENITIES_LIST)).optional(),
  location: z
    .object({
      type: z.literal('Point').default('Point').optional(),
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
  status: z.enum(LISTING_STATUSES).optional(),
  availableFrom: z
    .preprocess((v) => (v ? new Date(v as string | Date) : null), z.date().nullable().optional()),
  availableUntil: z
    .preprocess((v) => (v ? new Date(v as string | Date) : null), z.date().nullable().optional()),
});

export const statusUpdateSchema = z.object({
  status: z.enum(LISTING_STATUSES),
});

export type CreateListingFormData = z.infer<typeof createListingSchema>;
export type UpdateListingFormData = z.infer<typeof updateListingSchema>;
export type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

export interface ListingImageFile {
  file?: File;
  url: string;
  publicId?: string;
  originalName?: string;
  order?: number;
}

export function validateListingImages(
  images: Array<File | { url: string; size?: number; type?: string; name?: string }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!images || images.length < IMAGE_CONSTRAINTS.MIN_IMAGES) {
    errors.push(
      `At least ${IMAGE_CONSTRAINTS.MIN_IMAGES} property photos are required (maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES}).`
    );
  }

  if (images && images.length > IMAGE_CONSTRAINTS.MAX_IMAGES) {
    errors.push(`Maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES} images allowed per listing.`);
  }

  images.forEach((item, index) => {
    if (typeof window !== 'undefined' && item instanceof File) {
      if (item.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
        errors.push(
          `Image #${index + 1} (${item.name}) exceeds the 5MB limit (${(item.size / (1024 * 1024)).toFixed(1)}MB).`
        );
      }
      if (
        !IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(
          item.type as (typeof IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES)[number]
        )
      ) {
        errors.push(
          `Image #${index + 1} (${item.name}) has an invalid format. Allowed: JPEG, PNG, WebP.`
        );
      }
    } else if (typeof item === 'object' && item !== null && 'size' in item && typeof item.size === 'number') {
      if (item.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
        errors.push(
          `Image #${index + 1}${item.name ? ` (${item.name})` : ''} exceeds the 5MB limit.`
        );
      }
      if (item.type && !IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(item.type as any)) {
        errors.push(
          `Image #${index + 1}${item.name ? ` (${item.name})` : ''} has an invalid format. Allowed: JPEG, PNG, WebP.`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
