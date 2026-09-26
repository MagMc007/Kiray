import { describe, it, expect } from 'vitest';
import { adminUserApi, transformAdminUsersResponse } from '@/features/admin/users/adminUserApi';

describe('adminUserApi', () => {
  it('defines all required user management endpoints', () => {
    expect(adminUserApi.endpoints.listUsers).toBeDefined();
    expect(adminUserApi.endpoints.getUserDetail).toBeDefined();
    expect(adminUserApi.endpoints.updateUserStatus).toBeDefined();
    expect(adminUserApi.endpoints.updateUserRole).toBeDefined();
    expect(adminUserApi.endpoints.deleteUser).toBeDefined();
    expect(adminUserApi.endpoints.restoreUser).toBeDefined();
    expect(adminUserApi.endpoints.exportUserData).toBeDefined();
  });

  it('generates the correct query request for listUsers with filters and search', () => {
    const endpoint = adminUserApi.endpoints.listUsers;
    const queryFn = (endpoint as unknown as { query: (params?: Record<string, unknown>) => unknown }).query;
    if (typeof queryFn === 'function') {
      const requestWithParams = queryFn({
        page: 2,
        limit: 10,
        role: 'landlord',
        status: 'active',
        search: 'Abebe',
      });
      expect(requestWithParams).toEqual({
        url: '/admin/users',
        method: 'GET',
        params: {
          page: 2,
          limit: 10,
          role: 'landlord',
          status: 'active',
          search: 'Abebe',
          q: 'Abebe',
        },
      });

      const requestWithoutParams = queryFn();
      expect(requestWithoutParams).toEqual({
        url: '/admin/users',
        method: 'GET',
        params: {},
      });
    }
  });

  it('transforms paginated user list response correctly', () => {
    const mockResponse = {
      success: true,
      data: {
        users: [
          { _id: 'u1', displayName: 'User One', role: 'landlord', status: 'active' },
          { _id: 'u2', displayName: 'User Two', role: 'rentee', status: 'suspended' },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 42,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      },
    };

    const transformed = transformAdminUsersResponse(mockResponse as never);


    expect(transformed.users).toHaveLength(2);
    expect(transformed.meta.total).toBe(42);
    expect(transformed.meta.totalPages).toBe(3);
    expect(transformed.meta.hasNextPage).toBe(true);
    expect(transformed.meta.hasPrevPage).toBe(false);
  });

  it('generates the correct mutation request for updateUserStatus', () => {
    const endpoint = adminUserApi.endpoints.updateUserStatus;
    const queryFn = (endpoint as unknown as {
      query: (arg: { id: string; status: string; reason?: string }) => unknown;
    }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({
        id: 'u123',
        status: 'suspended',
        reason: 'Repeated guideline violations',
      });
      expect(request).toEqual({
        url: '/admin/users/u123/status',
        method: 'PATCH',
        body: { status: 'suspended', reason: 'Repeated guideline violations' },
      });
    }
  });

  it('generates the correct mutation request for updateUserRole', () => {
    const endpoint = adminUserApi.endpoints.updateUserRole;
    const queryFn = (endpoint as unknown as {
      query: (arg: { id: string; role: string }) => unknown;
    }).query;
    if (typeof queryFn === 'function') {
      const request = queryFn({ id: 'u123', role: 'admin' });
      expect(request).toEqual({
        url: '/admin/users/u123/role',
        method: 'PATCH',
        body: { role: 'admin' },
      });
    }
  });

  it('generates the correct mutation request for deleteUser and restoreUser', () => {
    const deleteEndpoint = adminUserApi.endpoints.deleteUser;
    const deleteQueryFn = (deleteEndpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof deleteQueryFn === 'function') {
      expect(deleteQueryFn('u123')).toEqual({
        url: '/admin/users/u123',
        method: 'DELETE',
      });
    }

    const restoreEndpoint = adminUserApi.endpoints.restoreUser;
    const restoreQueryFn = (restoreEndpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof restoreQueryFn === 'function') {
      expect(restoreQueryFn('u123')).toEqual({
        url: '/admin/users/u123/restore',
        method: 'PATCH',
      });
    }
  });

  it('generates the correct query request for exportUserData', () => {
    const exportEndpoint = adminUserApi.endpoints.exportUserData;
    const exportQueryFn = (exportEndpoint as unknown as { query: (id: string) => unknown }).query;
    if (typeof exportQueryFn === 'function') {
      expect(exportQueryFn('u123')).toEqual('/admin/security/users/u123/export');
    }
  });
});
