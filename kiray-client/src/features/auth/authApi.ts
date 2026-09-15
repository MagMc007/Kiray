import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type { User, UserRole } from '@/types/user';

export interface SyncUserRequest {
  role?: UserRole;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    syncUser: builder.mutation<User, SyncUserRequest | void>({
      query: (body) => ({
        url: '/auth/sync',
        method: 'POST',
        body: body || {},
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),
  }),
  overrideExisting: false,
});

export const { useSyncUserMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
