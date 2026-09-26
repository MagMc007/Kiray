import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  AdminListingReportsResponse,
  AdminPaginatedFlaggedListings,
  FlaggedListing,
  FlaggedListingSummary,
  ResolveListingFlagsPayload,
} from '@/types/admin';
import type { Listing } from '@/types/listing';
import type { Report } from '@/types/report';

export function transformAdminFlaggedListingsResponse(
  response: ApiResponse<{
    listings: FlaggedListing[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }>
): AdminPaginatedFlaggedListings {
  const data = unwrapApiResponse(response);
  const listings = data?.listings || [];
  const rawMeta = data?.meta;

  return {
    listings,
    meta: {
      page: rawMeta?.page ?? 1,
      limit: rawMeta?.limit ?? 20,
      total: rawMeta?.totalItems ?? listings.length,
      totalPages: rawMeta?.totalPages ?? 1,
      hasNextPage: rawMeta?.hasNext ?? false,
      hasPrevPage: rawMeta?.hasPrev ?? false,
    },
  };
}

export function transformListingReportsResponse(
  response: ApiResponse<{
    listing: FlaggedListingSummary;
    reports: Report[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }>
): AdminListingReportsResponse {
  const data = unwrapApiResponse(response);
  const listing = data?.listing;
  const reports = data?.reports || [];
  const rawMeta = data?.meta;

  return {
    listing: listing || {
      _id: '',
      title: '',
      slug: '',
      isFlagged: false,
      flagReason: null,
    },
    reports,
    meta: {
      page: rawMeta?.page ?? 1,
      limit: rawMeta?.limit ?? 20,
      total: rawMeta?.totalItems ?? reports.length,
      totalPages: rawMeta?.totalPages ?? 1,
      hasNextPage: rawMeta?.hasNext ?? false,
      hasPrevPage: rawMeta?.hasPrev ?? false,
    },
  };
}

export const adminModerationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFlaggedListings: builder.query<
      AdminPaginatedFlaggedListings,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: '/admin/flagged',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformAdminFlaggedListingsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.listings.map(({ _id }) => ({
                type: 'Flag' as const,
                id: _id,
              })),
              { type: 'Flag' as const, id: 'LIST' },
              { type: 'AdminListing' as const, id: 'LIST' },
            ]
          : [
              { type: 'Flag' as const, id: 'LIST' },
              { type: 'AdminListing' as const, id: 'LIST' },
            ],
    }),

    getListingFlags: builder.query<
      AdminListingReportsResponse,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page, limit }) => {
        const queryParams: Record<string, number> = {};
        if (page) queryParams.page = page;
        if (limit) queryParams.limit = limit;

        return {
          url: `/admin/listings/${id}/flags`,
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformListingReportsResponse,
      providesTags: (_result, _error, { id }) => [
        { type: 'Flag' as const, id },
        { type: 'Listing' as const, id },
      ],
    }),

    resolveListingFlags: builder.mutation<Listing, ResolveListingFlagsPayload>({
      query: ({ id, action, notes }) => ({
        url: `/admin/listings/${id}/resolve`,
        method: 'PATCH',
        body: { action, notes },
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Flag' as const, id },
        { type: 'Flag' as const, id: 'LIST' },
        { type: 'AdminListing' as const, id },
        { type: 'AdminListing' as const, id: 'LIST' },
        { type: 'Listing' as const, id },
        { type: 'ListingList' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFlaggedListingsQuery,
  useGetListingFlagsQuery,
  useResolveListingFlagsMutation,
} = adminModerationApi;
