import { describe, it, expect } from 'vitest';
import {
  createListingSchema,
  updateListingSchema,
  statusUpdateSchema,
  validateListingImages,
  IMAGE_CONSTRAINTS,
} from '@/lib/validation/listingSchema';

describe('listingSchema Validation', () => {
  const validListingPayload = {
    title: 'Modern 2 Bedroom Apartment in Bole',
    description: 'Spacious flat close to major amenities and transportation.',
    price: 35000,
    currency: 'ETB',
    propertyType: 'apartment' as const,
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    areaUnit: 'sqm' as const,
    amenities: ['wifi' as const, 'parking' as const, 'security' as const],
    location: {
      type: 'Point' as const,
      coordinates: [38.7892, 9.0015] as [number, number],
    },
    address: {
      street: 'Cameroon St',
      city: 'Addis Ababa',
      neighborhood: 'Bole',
      postalCode: '1000',
    },
    status: 'open' as const,
  };

  describe('createListingSchema', () => {
    it('validates a complete, valid listing payload', () => {
      const result = createListingSchema.safeParse(validListingPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Modern 2 Bedroom Apartment in Bole');
        expect(result.data.price).toBe(35000);
        expect(result.data.location.coordinates).toEqual([38.7892, 9.0015]);
      }
    });

    it('rejects title shorter than 3 characters or longer than 100 characters', () => {
      const tooShort = createListingSchema.safeParse({
        ...validListingPayload,
        title: 'AB',
      });
      expect(tooShort.success).toBe(false);

      const tooLong = createListingSchema.safeParse({
        ...validListingPayload,
        title: 'A'.repeat(101),
      });
      expect(tooLong.success).toBe(false);
    });

    it('rejects negative price', () => {
      const result = createListingSchema.safeParse({
        ...validListingPayload,
        price: -500,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative bedrooms or bathrooms', () => {
      const invalidBedrooms = createListingSchema.safeParse({
        ...validListingPayload,
        bedrooms: -1,
      });
      expect(invalidBedrooms.success).toBe(false);

      const invalidBathrooms = createListingSchema.safeParse({
        ...validListingPayload,
        bathrooms: -1,
      });
      expect(invalidBathrooms.success).toBe(false);
    });

    it('rejects invalid property type', () => {
      const result = createListingSchema.safeParse({
        ...validListingPayload,
        propertyType: 'mansion',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid coordinates array length', () => {
      const result = createListingSchema.safeParse({
        ...validListingPayload,
        location: {
          type: 'Point',
          coordinates: [38.7892],
        },
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing required address fields (street and city)', () => {
      const missingStreet = createListingSchema.safeParse({
        ...validListingPayload,
        address: {
          city: 'Addis Ababa',
        },
      });
      expect(missingStreet.success).toBe(false);
    });
  });

  describe('updateListingSchema', () => {
    it('accepts partial valid updates', () => {
      const partialUpdate = {
        title: 'Updated Sunlit Penthouse',
        price: 45000,
      };
      const result = updateListingSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('validates field constraints when field is provided in update', () => {
      const invalidPrice = updateListingSchema.safeParse({
        price: -100,
      });
      expect(invalidPrice.success).toBe(false);
    });
  });

  describe('statusUpdateSchema', () => {
    it('accepts valid statuses', () => {
      expect(statusUpdateSchema.safeParse({ status: 'open' }).success).toBe(true);
      expect(statusUpdateSchema.safeParse({ status: 'rented' }).success).toBe(true);
      expect(statusUpdateSchema.safeParse({ status: 'unavailable' }).success).toBe(true);
    });

    it('rejects unsupported status values', () => {
      expect(statusUpdateSchema.safeParse({ status: 'archived' }).success).toBe(false);
      expect(statusUpdateSchema.safeParse({ status: 'pending' }).success).toBe(false);
    });
  });

  describe('validateListingImages (Enforcing minimum 2 and maximum 6 images)', () => {
    it('fails when fewer than 2 images are provided', () => {
      const emptyImages: Array<{ url: string }> = [];
      const emptyResult = validateListingImages(emptyImages);
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.errors.some((e) => e.includes('At least 2 property photos are required'))).toBe(true);

      const oneImage = [{ url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg' }];
      const oneResult = validateListingImages(oneImage);
      expect(oneResult.valid).toBe(false);
      expect(oneResult.errors.some((e) => e.includes('At least 2 property photos are required'))).toBe(true);
    });

    it('passes when exactly 2 to 6 valid images are provided', () => {
      const twoImages = [
        { url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg' },
        { url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg' },
      ];
      const result = validateListingImages(twoImages);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('fails when more than 6 images are provided', () => {
      const sevenImages = Array.from({ length: 7 }, (_, i) => ({
        url: `https://res.cloudinary.com/demo/image/upload/sample${i}.jpg`,
      }));
      const result = validateListingImages(sevenImages);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Maximum 6 images allowed'))).toBe(true);
    });

    it('fails when an image exceeds the 5MB size limit', () => {
      const oversizedImage = {
        url: 'blob:http://localhost:3000/123',
        size: 6 * 1024 * 1024, // 6MB
        type: 'image/jpeg',
        name: 'heavy-photo.jpg',
      };
      const normalImage = {
        url: 'blob:http://localhost:3000/456',
        size: 2 * 1024 * 1024,
        type: 'image/jpeg',
        name: 'normal.jpg',
      };

      const result = validateListingImages([oversizedImage, normalImage]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds the 5MB limit'))).toBe(true);
    });

    it('fails when an image has an invalid mime type', () => {
      const invalidTypeImage = {
        url: 'blob:http://localhost:3000/789',
        size: 1 * 1024 * 1024,
        type: 'application/pdf',
        name: 'document.pdf',
      };
      const normalImage = {
        url: 'blob:http://localhost:3000/456',
        size: 1 * 1024 * 1024,
        type: 'image/png',
        name: 'photo.png',
      };

      const result = validateListingImages([invalidTypeImage, normalImage]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid format'))).toBe(true);
    });
  });
});
