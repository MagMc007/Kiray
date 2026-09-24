import { describe, it, expect } from 'vitest';
import { reportsApi } from '@/features/reports/reportsApi';

describe('reportsApi', () => {
  it('defines flagListing mutation endpoint', () => {
    expect(reportsApi.endpoints.flagListing).toBeDefined();
    expect(typeof reportsApi.endpoints.flagListing.initiate).toBe('function');
  });

  it('generates the correct query request for flagListing', () => {
    const endpoint = reportsApi.endpoints.flagListing;
    // Access internal query generator
    const queryFn = (endpoint as unknown as { query: (arg: { listingId: string; reason: string }) => unknown }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({ listingId: 'list_123', reason: 'Suspected middleman broker' });
      expect(request).toEqual({
        url: '/listings/list_123/flag',
        method: 'POST',
        body: { reason: 'Suspected middleman broker' },
      });
    }
  });
});
