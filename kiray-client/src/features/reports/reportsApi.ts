import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type { Listing } from '@/types/listing';

export interface FlagListingPayload {
  listingId: string;
  reason: string;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    flagListing: builder.mutation<Listing, FlagListingPayload>({
      query: ({ listingId, reason }) => ({
        url: `/listings/${listingId}/flag`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: ApiResponse<Listing>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: 'Listing', id: listingId },
        { type: 'Flag', id: 'LIST' },
        { type: 'AdminListing', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useFlagListingMutation } = reportsApi;
