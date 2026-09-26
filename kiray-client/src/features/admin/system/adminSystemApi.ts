import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  PurgeSoftDeletedPayload,
  PurgeSoftDeletedResult,
  SystemConfig,
  SystemHealth,
  UpdateSystemConfigPayload,
} from '@/types/system';

export const adminSystemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<SystemHealth, void>({
      query: () => ({
        url: '/admin/system/health',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<SystemHealth>) =>
        unwrapApiResponse(response),
      providesTags: [{ type: 'SystemConfig', id: 'HEALTH' }],
    }),

    getConfig: builder.query<SystemConfig, void>({
      query: () => ({
        url: '/admin/system/config',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<SystemConfig>) =>
        unwrapApiResponse(response),
      providesTags: [{ type: 'SystemConfig', id: 'CONFIG' }],
    }),

    updateConfig: builder.mutation<SystemConfig, UpdateSystemConfigPayload>({
      query: (body) => ({
        url: '/admin/system/config',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<SystemConfig>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        { type: 'SystemConfig', id: 'CONFIG' },
        { type: 'SystemConfig', id: 'HEALTH' },
        { type: 'AuditLog', id: 'LIST' },
      ],
    }),

    purgeSoftDeleted: builder.mutation<PurgeSoftDeletedResult, PurgeSoftDeletedPayload | void>({
      query: (body) => ({
        url: '/admin/system/maintenance/purge-soft-deleted',
        method: 'POST',
        body: body || {},
      }),
      transformResponse: (response: ApiResponse<PurgeSoftDeletedResult>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        { type: 'AdminListing', id: 'LIST' },
        { type: 'AdminUser', id: 'LIST' },
        { type: 'ListingList', id: 'LIST' },
        { type: 'Listing', id: 'LIST' },
        { type: 'AuditLog', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHealthQuery,
  useGetConfigQuery,
  useUpdateConfigMutation,
  usePurgeSoftDeletedMutation,
} = adminSystemApi;
