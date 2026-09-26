import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  AdminPaginatedUsers,
  AdminUserDetail,
  AdminUserExportData,
  AdminUserListParams,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from '@/types/admin';
import type { User } from '@/types/user';

export function transformAdminUsersResponse(
  response: ApiResponse<{
    users: User[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  }>
): AdminPaginatedUsers {
  const data = unwrapApiResponse(response);
  const users = data?.users || [];
  const rawMeta = data?.meta;

  return {
    users,
    meta: {
      page: rawMeta?.page ?? 1,
      limit: rawMeta?.limit ?? 20,
      total: rawMeta?.totalItems ?? users.length,
      totalPages: rawMeta?.totalPages ?? 1,
      hasNextPage: rawMeta?.hasNext ?? false,
      hasPrevPage: rawMeta?.hasPrev ?? false,
    },
  };
}

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<AdminPaginatedUsers, AdminUserListParams | void>({
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
          url: '/admin/users',
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: transformAdminUsersResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({
                type: 'AdminUser' as const,
                id: _id,
              })),
              { type: 'AdminUser' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminUser' as const, id: 'LIST' }],
    }),

    getUserDetail: builder.query<AdminUserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (response: ApiResponse<AdminUserDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: 'AdminUser', id }],
    }),

    updateUserStatus: builder.mutation<User, UpdateUserStatusPayload>({
      query: ({ id, status, reason }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      transformResponse: (response: ApiResponse<User>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUser', id: 'LIST' },
        { type: 'AdminUser', id },
        { type: 'User', id },
      ],
    }),

    updateUserRole: builder.mutation<User, UpdateUserRolePayload>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response: ApiResponse<User>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUser', id: 'LIST' },
        { type: 'AdminUser', id },
        { type: 'User', id },
      ],
    }),

    deleteUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<User>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminUser', id: 'LIST' },
        { type: 'AdminUser', id },
        { type: 'AdminListing', id: 'LIST' },
      ],
    }),

    restoreUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/admin/users/${id}/restore`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<User>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminUser', id: 'LIST' },
        { type: 'AdminUser', id },
      ],
    }),

    exportUserData: builder.query<AdminUserExportData, string>({
      query: (id) => `/admin/security/users/${id}/export`,
      transformResponse: (response: ApiResponse<AdminUserExportData>) =>
        unwrapApiResponse(response),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListUsersQuery,
  useLazyListUsersQuery,
  useGetUserDetailQuery,
  useLazyGetUserDetailQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useExportUserDataQuery,
  useLazyExportUserDataQuery,
} = adminUserApi;
