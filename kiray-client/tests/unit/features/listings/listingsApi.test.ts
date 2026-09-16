import { describe, it, expect } from 'vitest';
import { listingsApi, transformListingsResponse } from '@/features/listings/listingsApi';
import type { ApiResponse } from '@/types/api';
import type { Listing } from '@/types/listing';

describe('listingsApi', () => {
  it('defines searchListings endpoint', () => {
    expect(listingsApi.endpoints.searchListings).toBeDefined();
    expect(typeof listingsApi.endpoints.searchListings.initiate).toBe('function');
  });

  it('defines getListing endpoint', () => {
    expect(listingsApi.endpoints.getListing).toBeDefined();
    expect(typeof listingsApi.endpoints.getListing.initiate).toBe('function');
  });

  it('defines getNearbyListings endpoint', () => {
    expect(listingsApi.endpoints.getNearbyListings).toBeDefined();
    expect(typeof listingsApi.endpoints.getNearbyListings.initiate).toBe('function');
  });

  it('defines getSimilarListings endpoint', () => {
    expect(listingsApi.endpoints.getSimilarListings).toBeDefined();
    expect(typeof listingsApi.endpoints.getSimilarListings.initiate).toBe('function');
  });

  it('normalizes searchListings response with results, data, and meta', () => {
    const mockListing: Listing = {
      _id: 'listing_001',
      ownerId: 'owner_123',
      title: 'Sunny 2-Bedroom in Bole',
      slug: 'sunny-2-bedroom-in-bole',
      description: 'Modern apartment in central Bole',
      price: 25000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 110,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking', 'backup_generator'],
      location: {
        type: 'Point',
        coordinates: [38.7892, 9.0015],
      },
      address: {
        street: 'Cameroon St',
        city: 'Addis Ababa',
        neighborhood: 'Bole',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          publicId: 'img_001',
          order: 0,
        },
      ],
      status: 'open',
      viewCount: 42,
      saveCount: 5,
      contactClickCount: 3,
      averageRating: 4.8,
      totalComments: 6,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const envelope: ApiResponse<{
      data: Listing[];
      meta: {
        page: number;
        limit: number;
        total: number;
      };
    }> = {
      success: true,
      message: 'Listings retrieved successfully',
      data: {
        data: [mockListing],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    };

    const transformed = transformListingsResponse(envelope);
    expect(transformed.results).toHaveLength(1);
    expect(transformed.data).toHaveLength(1);
    expect(transformed.results[0].title).toBe('Sunny 2-Bedroom in Bole');
    expect(transformed.meta.total).toBe(1);
  });
});
