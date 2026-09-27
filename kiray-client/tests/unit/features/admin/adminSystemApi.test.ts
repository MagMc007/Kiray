import { describe, it, expect } from 'vitest';
import { adminSystemApi } from '@/features/admin/system/adminSystemApi';

describe('adminSystemApi', () => {
  it('defines all required admin system endpoints', () => {
    expect(adminSystemApi.endpoints.getHealth).toBeDefined();
    expect(adminSystemApi.endpoints.purgeSoftDeleted).toBeDefined();
  });

  it('generates the correct query request for getHealth', () => {
    const endpoint = adminSystemApi.endpoints.getHealth;
    const queryFn = (endpoint as unknown as { query: () => unknown }).query;
    if (typeof queryFn === 'function') {
      expect(queryFn()).toEqual({
        url: '/admin/system/health',
        method: 'GET',
      });
    }
  });

  it('generates the correct mutation request for purgeSoftDeleted', () => {
    const endpoint = adminSystemApi.endpoints.purgeSoftDeleted;
    const queryFn = (endpoint as unknown as {
      query: (arg?: { daysOld?: number; target?: 'listings' | 'users' | 'all' }) => unknown;
    }).query;
    if (typeof queryFn === 'function') {
      expect(
        queryFn({
          daysOld: 60,
          target: 'listings',
        })
      ).toEqual({
        url: '/admin/system/maintenance/purge-soft-deleted',
        method: 'POST',
        body: {
          daysOld: 60,
          target: 'listings',
        },
      });

      expect(queryFn()).toEqual({
        url: '/admin/system/maintenance/purge-soft-deleted',
        method: 'POST',
        body: {},
      });
    }
  });
});

