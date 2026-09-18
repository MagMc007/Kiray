import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse, PaginatedMeta } from '@/types/api';
import type { Favorite } from '@/types/favorite';
import type { Listing, PaginatedListings } from '@/types/listing';

export interface SavedListingsParams {
  page?: number;
  limit?: number;
}

export function transformSavedListingsResponse(
  response: ApiResponse<{
    results?: Listing[];
    data?: Listing[];
    meta?: PaginatedMeta;
  }>
): PaginatedListings {
  const payload = response.data;
  const items = payload?.results || payload?.data || [];
  const meta: PaginatedMeta = payload?.meta || {
    page: 1,
    limit: 20,
    total: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    results: items,
    data: items,
    meta,
  };
}

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSavedListings: builder.query<PaginatedListings, SavedListingsParams | void>({
      query: (params) => ({
        url: '/users/me/saved-listings',
        method: 'GET',
        params: params || { page: 1, limit: 20 },
      }),
      transformResponse: transformSavedListingsResponse,
      providesTags: (result) =>
        result
          ? [
              { type: 'Favorite' as const, id: 'LIST' },
              ...result.results.map(({ _id }) => ({
                type: 'Favorite' as const,
                id: _id,
              })),
            ]
          : [{ type: 'Favorite' as const, id: 'LIST' }],
    }),

    saveListing: builder.mutation<Favorite, string>({
      query: (listingId) => ({
        url: `/listings/${listingId}/save`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Favorite>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, listingId) => [
        { type: 'Favorite', id: 'LIST' },
        { type: 'Listing', id: listingId },
      ],
    }),

    unsaveListing: builder.mutation<Favorite, string>({
      query: (listingId) => ({
        url: `/listings/${listingId}/save`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<Favorite>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, listingId) => [
        { type: 'Favorite', id: 'LIST' },
        { type: 'Favorite', id: listingId },
        { type: 'Listing', id: listingId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSavedListingsQuery,
  useLazyGetSavedListingsQuery,
  useSaveListingMutation,
  useUnsaveListingMutation,
} = favoritesApi;
