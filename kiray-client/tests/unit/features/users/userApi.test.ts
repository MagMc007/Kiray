import { describe, it, expect } from 'vitest';
import { userApi, transformMyListingsResponse } from '@/features/users/userApi';
import type { ApiResponse } from '@/types/api';
import type { Listing } from '@/types/listing';

describe('userApi Endpoints', () => {
  it('defines getMyListings query endpoint', () => {
    expect(userApi.endpoints.getMyListings).toBeDefined();
    expect(typeof userApi.endpoints.getMyListings.initiate).toBe('function');
  });

  it('defines getUserProfile query endpoint', () => {
    expect(userApi.endpoints.getUserProfile).toBeDefined();
    expect(typeof userApi.endpoints.getUserProfile.initiate).toBe('function');
  });

  it('defines getUserListings query endpoint', () => {
    expect(userApi.endpoints.getUserListings).toBeDefined();
    expect(typeof userApi.endpoints.getUserListings.initiate).toBe('function');

    const endpoint = userApi.endpoints.getUserListings;
    const queryFn = (endpoint as unknown as { query: (arg: { userId: string; page?: number; limit?: number }) => unknown }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({ userId: 'owner_999', page: 2, limit: 10 });
      expect(request).toEqual({
        url: '/users/owner_999/listings',
        method: 'GET',
        params: { page: 2, limit: 10 },
      });
    }
  });

  it('defines updateProfile and updateContact mutation endpoints', () => {
    expect(userApi.endpoints.updateProfile).toBeDefined();
    expect(typeof userApi.endpoints.updateProfile.initiate).toBe('function');
    expect(userApi.endpoints.updateContact).toBeDefined();
    expect(typeof userApi.endpoints.updateContact.initiate).toBe('function');

    const endpoint = userApi.endpoints.updateProfile;
    const queryFn = (endpoint as unknown as { query: (arg: Record<string, unknown>) => unknown }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({
        fullName: 'Alemayehu Tadesse',
        whatsapp: '+251911223344',
      });
      expect(request).toEqual({
        url: '/users/me',
        method: 'PUT',
        body: {
          fullName: 'Alemayehu Tadesse',
          whatsapp: '+251911223344',
        },
      });
    }
  });

  it('normalizes getMyListings response when backend returns results + meta', () => {
    const mockListing: Listing = {
      _id: 'listing_my_01',
      ownerId: 'owner_me',
      title: 'My Bole Apartment',
      slug: 'my-bole-apartment',
      description: 'Cozy place',
      price: 28000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      areaUnit: 'sqm',
      amenities: ['wifi'],
      location: {
        type: 'Point',
        coordinates: [38.78, 9.0],
      },
      address: {
        street: 'Ring Road',
        city: 'Addis Ababa',
      },
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
          publicId: 'sample1',
          order: 0,
        },
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
          publicId: 'sample2',
          order: 1,
        },
      ],
      status: 'open',
      viewCount: 15,
      saveCount: 3,
      contactClickCount: 2,
      averageRating: 5.0,
      totalComments: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
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
      message: 'My listings retrieved',
      data: {
        results: [mockListing],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    };

    const transformed = transformMyListingsResponse(envelope);
    expect(transformed.results).toHaveLength(1);
    expect(transformed.data).toHaveLength(1);
    expect(transformed.results[0].title).toBe('My Bole Apartment');
    expect(transformed.meta.total).toBe(1);
  });

  it('handles array format in transformMyListingsResponse', () => {
    const mockListing = {
      _id: 'listing_02',
      title: 'Simple Flat',
    } as Listing;

    const envelope: ApiResponse<Listing[]> = {
      success: true,
      data: [mockListing],
    };

    const transformed = transformMyListingsResponse(envelope);
    expect(transformed.results).toHaveLength(1);
    expect(transformed.meta.total).toBe(1);
  });
});
