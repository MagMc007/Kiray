import { describe, it, expect } from 'vitest';
import {
  favoritesApi,
  transformSavedListingsResponse,
} from '@/features/favorites/favoritesApi';
import type { ApiResponse } from '@/types/api';
import type { Listing } from '@/types/listing';

describe('favoritesApi', () => {
  it('defines getSavedListings query endpoint', () => {
    expect(favoritesApi.endpoints.getSavedListings).toBeDefined();
    expect(typeof favoritesApi.endpoints.getSavedListings.initiate).toBe('function');
  });

  it('defines saveListing mutation endpoint', () => {
    expect(favoritesApi.endpoints.saveListing).toBeDefined();
    expect(typeof favoritesApi.endpoints.saveListing.initiate).toBe('function');
  });

  it('defines unsaveListing mutation endpoint', () => {
    expect(favoritesApi.endpoints.unsaveListing).toBeDefined();
    expect(typeof favoritesApi.endpoints.unsaveListing.initiate).toBe('function');
  });

  it('normalizes saved listings response with results, data, and meta', () => {
    const mockListing: Listing = {
      _id: 'listing_saved_1',
      ownerId: 'owner_123',
      title: 'Bole Medhanealem Condo',
      slug: 'bole-medhanealem-condo',
      price: 22000,
      propertyType: 'condo',
      bedrooms: 2,
      bathrooms: 1,
      images: [],
      status: 'open',
    };

    const envelope: ApiResponse<{
      results: Listing[];
      meta: {
        page: number;
        limit: number;
        total: number;
      };
    }> = {
      success: true,
      message: 'Saved listings retrieved successfully',
      data: {
        results: [mockListing],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    };

    const result = transformSavedListingsResponse(envelope);
    expect(result.results).toHaveLength(1);
    expect(result.data).toHaveLength(1);
    expect(result.results[0].title).toBe('Bole Medhanealem Condo');
    expect(result.meta.total).toBe(1);
  });
});
