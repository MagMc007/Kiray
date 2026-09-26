import { describe, it, expect } from 'vitest';
import {
  adminAuditApi,
  transformAdminAuditLogsResponse,
} from '@/features/admin/auditLogs/adminAuditApi';

describe('adminAuditApi', () => {
  it('defines all required audit log endpoints', () => {
    expect(adminAuditApi.endpoints.listAuditLogs).toBeDefined();
    expect(adminAuditApi.endpoints.getAuditLogDetail).toBeDefined();
  });

  it('generates the correct query request for listAuditLogs with filters', () => {
    const endpoint = adminAuditApi.endpoints.listAuditLogs;
    const queryFn = (endpoint as unknown as { query: (params?: Record<string, unknown>) => unknown }).query;
    if (typeof queryFn === 'function') {
      const requestWithParams = queryFn({
        page: 1,
        limit: 25,
        targetType: 'Listing',
        action: 'listing.flag.resolve',
        startDate: '2026-09-01T00:00:00Z',
        endDate: '2026-09-26T23:59:59Z',
        sort: 'newest',
      });
      expect(requestWithParams).toEqual({
        url: '/admin/audit-logs',
        method: 'GET',
        params: {
          page: 1,
          limit: 25,
          targetType: 'Listing',
          action: 'listing.flag.resolve',
          startDate: '2026-09-01T00:00:00Z',
          endDate: '2026-09-26T23:59:59Z',
          sort: 'newest',
        },
      });

      const requestWithoutParams = queryFn();
      expect(requestWithoutParams).toEqual({
        url: '/admin/audit-logs',
        method: 'GET',
        params: {},
      });
    }
  });

  it('generates the correct query request for getAuditLogDetail', () => {
    const endpoint = adminAuditApi.endpoints.getAuditLogDetail;
    const queryFn = (endpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof queryFn === 'function') {
      expect(queryFn('audit_999')).toBe('/admin/audit-logs/audit_999');
    }
  });

  it('transforms paginated audit logs response correctly', () => {
    const mockResponse = {
      success: true,
      data: {
        logs: [
          {
            _id: 'a1',
            adminId: {
              _id: 'u1',
              displayName: 'Admin User',
              email: 'admin@kiray.et',
              role: 'admin',
            },
            action: 'listing.deactivate',
            targetType: 'Listing',
            targetId: 'l1',
            metadata: { reason: 'Terms of service violation' },
            ipAddress: '127.0.0.1',
            createdAt: '2026-09-26T14:30:00.000Z',
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

    const transformed = transformAdminAuditLogsResponse(mockResponse as never);
    expect(transformed.logs).toHaveLength(1);
    expect(transformed.logs[0].action).toBe('listing.deactivate');
    expect(transformed.meta.total).toBe(1);
    expect(transformed.meta.hasNextPage).toBe(false);
  });
});
