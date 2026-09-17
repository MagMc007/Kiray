import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  Listing,
  ListingSearchParams,
  PaginatedListings,
} from '@/types/listing';

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number; // In meters
  limit?: number;
}

export function transformListingsResponse(
  response: ApiResponse<{
    data?: Listing[];
    results?: Listing[];
    meta?: import('@/types/api').PaginatedMeta;
  }>
): PaginatedListings {
  const payload = response.data;
  const items = payload?.data || payload?.results || [];
  const meta = payload?.meta || {
    page: 1,
    limit: items.length || 20,
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

export const listingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchListings: builder.query<PaginatedListings, ListingSearchParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number | boolean> = {};

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams[key] = value;
            }
          });
        }

        return {
          url: '/listings',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformListingsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ _id }) => ({ type: 'Listing' as const, id: _id })),
              { type: 'ListingList', id: 'SEARCH' },
              { type: 'ListingList', id: 'LIST' },
            ]
          : [{ type: 'ListingList', id: 'SEARCH' }],
    }),

    getListing: builder.query<Listing, string>({
      query: (idOrSlug) => ({
        url: `/listings/${idOrSlug}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<Listing>) => unwrapApiResponse(response),
      providesTags: (_result, _error, idOrSlug) => [{ type: 'Listing', id: idOrSlug }],
    }),

    getNearbyListings: builder.query<PaginatedListings, NearbySearchParams>({
      query: ({ lat, lng, radius = 5000, limit = 20 }) => ({
        url: '/listings/nearby',
        method: 'GET',
        params: { lat, lng, radius, limit },
      }),
      transformResponse: (
        response: ApiResponse<{
          data?: Listing[];
          results?: Listing[];
          meta?: import('@/types/api').PaginatedMeta;
        }>
      ): PaginatedListings => {
        const payload = response.data;
        const items = payload?.data || payload?.results || [];
        const meta = payload?.meta || {
          page: 1,
          limit: items.length || 20,
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
      },
      providesTags: [{ type: 'ListingList', id: 'NEARBY' }],
    }),

    getSimilarListings: builder.query<Listing[], string>({
      query: (id) => ({
        url: `/listings/${id}/similar`,
        method: 'GET',
      }),
      transformResponse: (
        response: ApiResponse<
          Listing[] | { results?: Listing[]; data?: Listing[] }
        >
      ) => {
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        return payload?.data || payload?.results || [];
      },
      providesTags: (_result, _error, id) => [{ type: 'Listing', id: `SIMILAR_${id}` }],
    }),

    trackView: builder.mutation<{ _id: string; viewCount: number }, string>({
      query: (id) => ({
        url: `/listings/${id}/view`,
        method: 'POST',
      }),
      transformResponse: (
        response: ApiResponse<{ _id: string; viewCount: number }>
      ) => unwrapApiResponse(response),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchListingsQuery,
  useLazySearchListingsQuery,
  useGetListingQuery,
  useLazyGetListingQuery,
  useGetNearbyListingsQuery,
  useLazyGetNearbyListingsQuery,
  useGetSimilarListingsQuery,
  useLazyGetSimilarListingsQuery,
  useTrackViewMutation,
} = listingsApi;
