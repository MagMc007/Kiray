import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';
import type { Listing, ListingStatus, PaginatedListings } from '@/types/listing';
import { setCurrentUser } from '@/features/auth/authSlice';

export interface MyListingsParams {
  page?: number;
  limit?: number;
  status?: ListingStatus;
}

export function transformMyListingsResponse(
  response: ApiResponse<{
    data?: Listing[];
    results?: Listing[];
    meta?: import('@/types/api').PaginatedMeta;
  } | Listing[]>
): PaginatedListings {
  const payload = response.data;
  let items: Listing[] = [];
  let meta: import('@/types/api').PaginatedMeta = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (Array.isArray(payload)) {
    items = payload;
    meta.total = items.length;
    meta.limit = items.length || 20;
  } else if (payload && typeof payload === 'object') {
    items = payload.results || payload.data || [];
    if (payload.meta) {
      meta = payload.meta;
    } else {
      meta.total = items.length;
      meta.limit = items.length || 20;
    }
  }

  return {
    results: items,
    data: items,
    meta,
  };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyListings: builder.query<PaginatedListings, MyListingsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status) queryParams.status = params.status;

        return {
          url: '/users/me/listings',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformMyListingsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ _id }) => ({ type: 'Listing' as const, id: _id })),
              { type: 'ListingList', id: 'MY_LISTINGS' },
            ]
          : [{ type: 'ListingList', id: 'MY_LISTINGS' }],
    }),

    getUserProfile: builder.query<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch {
          // ignore or handled by callers
        }
      },
    }),

    updateContact: builder.mutation<
      User,
      { phone?: string; whatsapp?: string; telegram?: string }
    >({
      query: (body) => ({
        url: '/users/me/contact',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyListingsQuery,
  useLazyGetMyListingsQuery,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateProfileMutation,
  useUpdateContactMutation,
} = userApi;
