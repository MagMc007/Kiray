import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiError, ApiErrorResponse, ApiResponse } from '@/types/api';

export const TAG_TYPES = [
  'Listing',
  'ListingList',
  'Comment',
  'Favorite',
  'User',
  'AdminUser',
  'AdminListing',
  'Flag',
  'AuditLog',
  'SystemConfig',
] as const;

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    prepareHeaders: async (headers, { getState }) => {
      // Defensively read token from auth state if present
      const state = getState() as { auth?: { idToken?: string; token?: string } };
      const token = state?.auth?.idToken || state?.auth?.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});

/**
 * Standard unwrap transformer for RTK Query endpoints.
 * Unwraps the Kiray backend envelope: { success: true, message?: string, data: T } -> T
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}

/**
 * Standard error normalizer for RTK Query endpoints.
 * Maps { success: false, error?: string, message?: string, details?: string[] } to typed ApiError
 */
export function normalizeApiError(errorResponse: {
  status: number | string;
  data?: unknown;
}): ApiError {
  const statusNumber = typeof errorResponse.status === 'number' ? errorResponse.status : 500;
  const data = errorResponse.data as ApiErrorResponse | undefined;

  return {
    status: statusNumber,
    message: data?.error || data?.message || 'An unexpected error occurred',
    details: data?.details,
  };
}
