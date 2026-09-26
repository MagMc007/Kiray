import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse } from '@/types/api';
import type {
  AdminDashboardMetrics,
  ActivityAnalytics,
  ActivityAnalyticsPeriod,
} from '@/types/admin';

export interface ActivityAnalyticsQueryArgs {
  period?: ActivityAnalyticsPeriod;
}

export const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<AdminDashboardMetrics, void>({
      query: () => '/admin/dashboard',
      transformResponse: (response: ApiResponse<AdminDashboardMetrics>) =>
        unwrapApiResponse(response),
      providesTags: ['User', 'AdminUser', 'Listing', 'AdminListing', 'Flag'],
    }),

    getActivityAnalytics: builder.query<ActivityAnalytics, ActivityAnalyticsQueryArgs | void>({
      query: (args) => ({
        url: '/admin/analytics/activity',
        params: args?.period ? { period: args.period } : undefined,
      }),
      transformResponse: (response: ApiResponse<ActivityAnalytics>) =>
        unwrapApiResponse(response),
      providesTags: ['AdminUser', 'AdminListing'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardQuery,
  useGetActivityAnalyticsQuery,
} = adminDashboardApi;
