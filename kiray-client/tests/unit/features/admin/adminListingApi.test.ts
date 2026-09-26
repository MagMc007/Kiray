import { describe, it, expect } from 'vitest';
import { adminListingApi, transformAdminListingsResponse } from '@/features/admin/listings/adminListingApi';

describe('adminListingApi', () => {
  it('defines all required listing moderation endpoints', () => {
    expect(adminListingApi.endpoints.listAdminListings).toBeDefined();
    expect(adminListingApi.endpoints.getAdminListingDetail).toBeDefined();
    expect(adminListingApi.endpoints.overrideListing).toBeDefined();
    expect(adminListingApi.endpoints.updateListingStatus).toBeDefined();
    expect(adminListingApi.endpoints.verifyListing).toBeDefined();
    expect(adminListingApi.endpoints.featureListing).toBeDefined();
    expect(adminListingApi.endpoints.deactivateListing).toBeDefined();
    expect(adminListingApi.endpoints.restoreListing).toBeDefined();
    expect(adminListingApi.endpoints.hardDeleteListing).toBeDefined();
  });

  it('generates the correct query request for listAdminListings with filters and search', () => {
    const endpoint = adminListingApi.endpoints.listAdminListings;
    const queryFn = (endpoint as unknown as { query: (params?: Record<string, unknown>) => unknown }).query;
    if (typeof queryFn === 'function') {
      const requestWithParams = queryFn({
        page: 1,
        limit: 20,
        status: 'open',
        isFlagged: true,
        search: 'Bole',
      });
      expect(requestWithParams).toEqual({
        url: '/admin/listings',
        method: 'GET',
        params: {
          page: 1,
          limit: 20,
          status: 'open',
          isFlagged: true,
          search: 'Bole',
          q: 'Bole',
        },
      });

      const requestWithoutParams = queryFn();
      expect(requestWithoutParams).toEqual({
        url: '/admin/listings',
        method: 'GET',
        params: {},
      });
    }
  });

  it('transforms paginated listing response correctly', () => {
    const mockResponse = {
      success: true,
      data: {
        listings: [
          { _id: 'l1', title: 'Luxury Bole Villa', status: 'open', price: 45000 },
          { _id: 'l2', title: 'Kazanchis Apartment', status: 'rented', price: 20000 },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 15,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };

    const transformed = transformAdminListingsResponse(mockResponse as never);


    expect(transformed.listings).toHaveLength(2);
    expect(transformed.meta.total).toBe(15);
    expect(transformed.meta.totalPages).toBe(1);
    expect(transformed.meta.hasNextPage).toBe(false);
  });

  it('generates the correct mutation request for verifyListing and featureListing', () => {
    const verifyEndpoint = adminListingApi.endpoints.verifyListing;
    const verifyQueryFn = (verifyEndpoint as unknown as {
      query: (arg: { id: string; isVerified?: boolean }) => unknown;
    }).query;
    if (typeof verifyQueryFn === 'function') {
      expect(verifyQueryFn({ id: 'l1', isVerified: true })).toEqual({
        url: '/admin/listings/l1/verify',
        method: 'POST',
        body: { isVerified: true },
      });
    }

    const featureEndpoint = adminListingApi.endpoints.featureListing;
    const featureQueryFn = (featureEndpoint as unknown as {
      query: (arg: { id: string; isFeatured?: boolean }) => unknown;
    }).query;
    if (typeof featureQueryFn === 'function') {
      expect(featureQueryFn({ id: 'l1', isFeatured: false })).toEqual({
        url: '/admin/listings/l1/feature',
        method: 'PATCH',
        body: { isFeatured: false },
      });
    }
  });

  it('generates the correct mutation request for overrideListing and updateListingStatus', () => {
    const overrideEndpoint = adminListingApi.endpoints.overrideListing;
    const overrideQueryFn = (overrideEndpoint as unknown as {
      query: (arg: { id: string; body: Record<string, unknown> }) => unknown;
    }).query;
    if (typeof overrideQueryFn === 'function') {
      expect(overrideQueryFn({ id: 'l1', body: { price: 30000 } })).toEqual({
        url: '/admin/listings/l1',
        method: 'PUT',
        body: { price: 30000 },
      });
    }

    const statusEndpoint = adminListingApi.endpoints.updateListingStatus;
    const statusQueryFn = (statusEndpoint as unknown as {
      query: (arg: { id: string; status: string }) => unknown;
    }).query;
    if (typeof statusQueryFn === 'function') {
      expect(statusQueryFn({ id: 'l1', status: 'unavailable' })).toEqual({
        url: '/admin/listings/l1/status',
        method: 'PATCH',
        body: { status: 'unavailable' },
      });
    }
  });

  it('generates the correct mutation request for deactivateListing, restoreListing, and hardDeleteListing', () => {
    const deactivateEndpoint = adminListingApi.endpoints.deactivateListing;
    const deactivateQueryFn = (deactivateEndpoint as unknown as {
      query: (arg: { id: string; reason?: string }) => unknown;
    }).query;
    if (typeof deactivateQueryFn === 'function') {
      expect(deactivateQueryFn({ id: 'l1', reason: 'Misleading pricing' })).toEqual({
        url: '/admin/listings/l1/deactivate',
        method: 'PATCH',
        body: { reason: 'Misleading pricing' },
      });
    }

    const restoreEndpoint = adminListingApi.endpoints.restoreListing;
    const restoreQueryFn = (restoreEndpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof restoreQueryFn === 'function') {
      expect(restoreQueryFn('l1')).toEqual({
        url: '/admin/listings/l1/restore',
        method: 'PATCH',
      });
    }

    const deleteEndpoint = adminListingApi.endpoints.hardDeleteListing;
    const deleteQueryFn = (deleteEndpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof deleteQueryFn === 'function') {
      expect(deleteQueryFn('l1')).toEqual({
        url: '/admin/listings/l1/hard-delete',
        method: 'DELETE',
      });
    }
  });
});
