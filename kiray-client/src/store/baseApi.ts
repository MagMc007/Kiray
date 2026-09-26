import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { ApiError, ApiErrorResponse, ApiResponse } from '@/types/api';

import { getCurrentIdToken } from '@/features/auth/firebase';

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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  prepareHeaders: async (headers, { getState }) => {
    const state = getState() as { auth?: { idToken?: string; token?: string } };
    let token = state?.auth?.idToken || state?.auth?.token;

    if (!token) {
      try {
        token = (await getCurrentIdToken()) || undefined;
      } catch {
        // ignore error if firebase is uninitialized
      }
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithDevCache: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Surface X-Cache header in dev mode for debugging
  if (process.env.NODE_ENV === 'development' && result.meta?.response) {
    const xCache = result.meta.response.headers.get('x-cache');
    if (xCache) {
      const url = typeof args === 'string' ? args : args.url;
      console.debug(`[X-Cache] ${url}: ${xCache}`);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithDevCache,
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
 * Standardizes 429 rate limits and 400 validation details
 */
export function normalizeApiError(errorResponse: {
  status: number | string;
  data?: unknown;
}): ApiError {
  const statusNumber = typeof errorResponse.status === 'number' ? errorResponse.status : 500;
  const data = errorResponse.data as ApiErrorResponse | undefined;

  let message = data?.error || data?.message || 'An unexpected error occurred';
  const details = data?.details;

  if (statusNumber === 429) {
    message = data?.error || data?.message || 'Rate limit exceeded. Please wait a moment before trying again.';
  } else if (
    statusNumber === 400 &&
    details &&
    details.length > 0 &&
    !data?.error &&
    !data?.message
  ) {
    message = details.join('; ');
  }

  return {
    status: statusNumber,
    message,
    details,
  };
}
