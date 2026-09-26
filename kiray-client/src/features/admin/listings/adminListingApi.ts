import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  AdminListingDeactivatePayload,
  AdminListingDetail,
  AdminListingFeaturePayload,
  AdminListingListParams,
  AdminListingOverridePayload,
  AdminListingStatusPayload,
  AdminListingVerifyPayload,
  AdminPaginatedListings,
} from '@/types/admin';
import type { Listing, PopulatedListing } from '@/types/listing';

export function transformAdminListingsResponse(
  response: ApiResponse<{
    listings: PopulatedListing[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }>
): AdminPaginatedListings {
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

export const adminListingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAdminListings: builder.query<AdminPaginatedListings, AdminListingListParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number | boolean> = {};

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams[key] = value;
            }
          });

          // Ensure backend `q` parameter is set if search is provided
          if (params.search && !queryParams.q) {
            queryParams.q = params.search;
          }
        }

        return {
          url: '/admin/listings',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformAdminListingsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.listings.map(({ _id }) => ({
                type: 'AdminListing' as const,
                id: _id,
              })),
              { type: 'AdminListing' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminListing' as const, id: 'LIST' }],
    }),

    getAdminListingDetail: builder.query<AdminListingDetail, string>({
      query: (id) => `/admin/listings/${id}`,
      transformResponse: (response: ApiResponse<AdminListingDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    overrideListing: builder.mutation<Listing, AdminListingOverridePayload>({
      query: ({ id, body }) => ({
        url: `/admin/listings/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    updateListingStatus: builder.mutation<Listing, AdminListingStatusPayload>({
      query: ({ id, status }) => ({
        url: `/admin/listings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    verifyListing: builder.mutation<Listing, AdminListingVerifyPayload>({
      query: ({ id, isVerified = true }) => ({
        url: `/admin/listings/${id}/verify`,
        method: 'POST',
        body: { isVerified },
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    featureListing: builder.mutation<Listing, AdminListingFeaturePayload>({
      query: ({ id, isFeatured = true }) => ({
        url: `/admin/listings/${id}/feature`,
        method: 'PATCH',
        body: { isFeatured },
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    deactivateListing: builder.mutation<Listing, AdminListingDeactivatePayload>({
      query: ({ id, reason }) => ({
        url: `/admin/listings/${id}/deactivate`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    restoreListing: builder.mutation<Listing, string>({
      query: (id) => ({
        url: `/admin/listings/${id}/restore`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<Listing>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminListing', id },
        { type: 'Listing', id },
      ],
    }),

    hardDeleteListing: builder.mutation<{ message: string; deletedListingId: string }, string>({
      query: (id) => ({
        url: `/admin/listings/${id}/hard-delete`,
        method: 'DELETE',
      }),
      transformResponse: (
        response: ApiResponse<{ message: string; deletedListingId: string }>
      ) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'Listing', id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAdminListingsQuery,
  useLazyListAdminListingsQuery,
  useGetAdminListingDetailQuery,
  useLazyGetAdminListingDetailQuery,
  useOverrideListingMutation,
  useUpdateListingStatusMutation,
  useVerifyListingMutation,
  useFeatureListingMutation,
  useDeactivateListingMutation,
  useRestoreListingMutation,
  useHardDeleteListingMutation,
} = adminListingApi;
