import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  AdminPaginatedAuditLogs,
  AuditLogListParams,
} from '@/types/admin';
import type { AuditLog } from '@/types/auditLog';

export function transformAdminAuditLogsResponse(
  response: ApiResponse<{
    logs: AuditLog[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }>
): AdminPaginatedAuditLogs {
  const data = unwrapApiResponse(response);
  const logs = data?.logs || [];
  const rawMeta = data?.meta;

  return {
    logs,
    meta: {
      page: rawMeta?.page ?? 1,
      limit: rawMeta?.limit ?? 20,
      total: rawMeta?.totalItems ?? logs.length,
      totalPages: rawMeta?.totalPages ?? 1,
      hasNextPage: rawMeta?.hasNext ?? false,
      hasPrevPage: rawMeta?.hasPrev ?? false,
    },
  };
}

export const adminAuditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAuditLogs: builder.query<AdminPaginatedAuditLogs, AuditLogListParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams[key] = value;
            }
          });
        }

        return {
          url: '/admin/audit-logs',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformAdminAuditLogsResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.logs.map(({ _id }) => ({
                type: 'AuditLog' as const,
                id: _id,
              })),
              { type: 'AuditLog' as const, id: 'LIST' },
            ]
          : [{ type: 'AuditLog' as const, id: 'LIST' }],
    }),

    getAuditLogDetail: builder.query<AuditLog, string>({
      query: (id) => `/admin/audit-logs/${id}`,
      transformResponse: (response: ApiResponse<AuditLog>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: 'AuditLog' as const, id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAuditLogsQuery,
  useGetAuditLogDetailQuery,
} = adminAuditApi;
