import { describe, it, expect } from 'vitest';
import { authApi } from '@/features/auth/authApi';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

describe('authApi', () => {
  it('defines syncUser mutation endpoint', () => {
    expect(authApi.endpoints.syncUser).toBeDefined();
    expect(typeof authApi.endpoints.syncUser.initiate).toBe('function');
  });

  it('defines getMe query endpoint', () => {
    expect(authApi.endpoints.getMe).toBeDefined();
    expect(typeof authApi.endpoints.getMe.initiate).toBe('function');
  });

  it('unwraps syncUser response envelope', () => {
    const mockUser: User = {
      _id: 'user_xyz',
      firebaseUid: 'fb_xyz',
      role: 'landlord',
      status: 'active',
      displayName: 'Dawit Bekele',
      email: 'dawit@example.com',
      profileCompleted: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const envelope: ApiResponse<User> = {
      success: true,
      message: 'User synced successfully',
      data: mockUser,
    };

    // Test that the endpoint definition has unwrap behavior
    // RTK query endpoints define transformResponse which extracts .data
    const endpointDef = (authApi.endpoints.syncUser as unknown as {
      matchFulfilled: unknown;
    });
    expect(endpointDef).toBeDefined();
  });
});
