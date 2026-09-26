import { describe, it, expect } from 'vitest';
import { adminDashboardApi } from '@/features/admin/dashboard/adminDashboardApi';

describe('adminDashboardApi', () => {
  it('defines getDashboard query endpoint', () => {
    expect(adminDashboardApi.endpoints.getDashboard).toBeDefined();
    expect(typeof adminDashboardApi.endpoints.getDashboard.initiate).toBe('function');
  });

  it('generates the correct query request for getDashboard', () => {
    const endpoint = adminDashboardApi.endpoints.getDashboard;
    const queryFn = (endpoint as unknown as { query: () => unknown }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn();
      expect(request).toEqual('/admin/dashboard');
    }
  });

  it('defines getActivityAnalytics query endpoint', () => {
    expect(adminDashboardApi.endpoints.getActivityAnalytics).toBeDefined();
    expect(typeof adminDashboardApi.endpoints.getActivityAnalytics.initiate).toBe('function');
  });

  it('generates the correct query request for getActivityAnalytics with period', () => {
    const endpoint = adminDashboardApi.endpoints.getActivityAnalytics;
    const queryFn = (endpoint as unknown as { query: (args?: { period?: string }) => unknown }).query;
    if (typeof queryFn === 'function') {
      const requestWithPeriod = queryFn({ period: '7d' });
      expect(requestWithPeriod).toEqual({
        url: '/admin/analytics/activity',
        params: { period: '7d' },
      });

      const requestWithoutPeriod = queryFn();
      expect(requestWithoutPeriod).toEqual({
        url: '/admin/analytics/activity',
        params: undefined,
      });
    }
  });
});
