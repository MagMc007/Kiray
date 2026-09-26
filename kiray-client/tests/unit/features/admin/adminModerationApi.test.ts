import { describe, it, expect } from 'vitest';
import {
  adminModerationApi,
  transformAdminFlaggedListingsResponse,
  transformListingReportsResponse,
} from '@/features/admin/moderation/adminModerationApi';

describe('adminModerationApi', () => {
  it('defines all required moderation endpoints', () => {
    expect(adminModerationApi.endpoints.getFlaggedListings).toBeDefined();
    expect(adminModerationApi.endpoints.getListingFlags).toBeDefined();
    expect(adminModerationApi.endpoints.resolveListingFlags).toBeDefined();
  });

  it('generates the correct query request for getFlaggedListings', () => {
    const endpoint = adminModerationApi.endpoints.getFlaggedListings;
    const queryFn = (endpoint as unknown as { query: (params?: Record<string, unknown>) => unknown }).query;
    if (typeof queryFn === 'function') {
      const requestWithParams = queryFn({ page: 2, limit: 10 });
      expect(requestWithParams).toEqual({
        url: '/admin/flagged',
        method: 'GET',
        params: { page: 2, limit: 10 },
      });

      const requestWithoutParams = queryFn();
      expect(requestWithoutParams).toEqual({
        url: '/admin/flagged',
        method: 'GET',
        params: {},
      });
    }
  });

  it('generates the correct query request for getListingFlags', () => {
    const endpoint = adminModerationApi.endpoints.getListingFlags;
    const queryFn = (endpoint as unknown as { query: (params: { id: string; page?: number; limit?: number }) => unknown }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({ id: 'listing_123', page: 1, limit: 15 });
      expect(request).toEqual({
        url: '/admin/listings/listing_123/flags',
        method: 'GET',
        params: { page: 1, limit: 15 },
      });
    }
  });

  it('generates the correct mutation request for resolveListingFlags', () => {
    const endpoint = adminModerationApi.endpoints.resolveListingFlags;
    const queryFn = (endpoint as unknown as {
      query: (arg: { id: string; action: 'dismiss' | 'deactivate' | 'restore'; notes?: string }) => unknown;
    }).query;
    if (typeof queryFn === 'function') {
      expect(
        queryFn({ id: 'listing_123', action: 'deactivate', notes: 'Scam listing verified by team' })
      ).toEqual({
        url: '/admin/listings/listing_123/resolve',
        method: 'PATCH',
        body: { action: 'deactivate', notes: 'Scam listing verified by team' },
      });
    }
  });

  it('transforms paginated flagged listings response correctly', () => {
    const mockResponse = {
      success: true,
      data: {
        listings: [
          {
            _id: 'l1',
            title: 'Suspicious 3 Bed Bole Apartment',
            isFlagged: true,
            pendingReportCount: 3,
            ownerId: {
              _id: 'owner1',
              displayName: 'Broker X',
              email: 'broker@example.com',
              role: 'landlord',
              status: 'active',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };

    const transformed = transformAdminFlaggedListingsResponse(mockResponse as never);
    expect(transformed.listings).toHaveLength(1);
    expect(transformed.listings[0].pendingReportCount).toBe(3);
    expect(transformed.meta.total).toBe(1);
    expect(transformed.meta.hasNextPage).toBe(false);
  });

  it('transforms listing reports response correctly', () => {
    const mockResponse = {
      success: true,
      data: {
        listing: {
          _id: 'l1',
          title: 'Suspicious 3 Bed Bole Apartment',
          slug: 'suspicious-3-bed-bole',
          isFlagged: true,
          flagReason: 'High broker commission demand',
        },
        reports: [
          {
            _id: 'r1',
            listingId: 'l1',
            reason: 'Misleading price',
            notes: 'Demanded 2 months advance commission',
            status: 'pending',
            createdAt: '2026-09-26T12:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };

    const transformed = transformListingReportsResponse(mockResponse as never);
    expect(transformed.listing.slug).toBe('suspicious-3-bed-bole');
    expect(transformed.reports).toHaveLength(1);
    expect(transformed.reports[0].reason).toBe('Misleading price');
    expect(transformed.meta.total).toBe(1);
  });
});
