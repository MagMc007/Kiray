import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type { User, UserRole } from '@/types/user';
import { setCurrentUser } from './authSlice';

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
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch {
          // ignore or handled by callers
        }
      },
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<User>) => unwrapApiResponse(response),
      providesTags: [{ type: 'User', id: 'ME' }],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch {
          // ignore or handled by callers
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useSyncUserMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
