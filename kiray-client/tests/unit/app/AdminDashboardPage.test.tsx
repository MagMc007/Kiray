import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminDashboardPage from '@/app/admin/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';
import * as listingsApiModule from '@/features/listings/listingsApi';
import type { User } from '@/types/user';
import type { AdminDashboardMetrics } from '@/types/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal<typeof import('recharts')>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 400 }}>
        {children}
      </div>
    ),
  };
});

describe('AdminDashboardPage Integration (Steps 4 & 5)', () => {
  const mockAdmin: User = {
    _id: 'admin_1',
    email: 'admin@kiray.et',
    displayName: 'Super Admin',
    role: 'admin',
    status: 'active',
    firebaseUid: 'fb_admin_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockMetrics: AdminDashboardMetrics = {
    users: {
      total: 154,
      active: 148,
      suspended: 4,
      banned: 2,
      byRole: {
        landlord: 52,
        rentee: 98,
        admin: 4,
      },
    },
    listings: {
      total: 96,
      active: 88,
      flagged: 4,
      byPropertyType: [
        { propertyType: 'apartment', count: 60, active: 55 },
        { propertyType: 'villa', count: 36, active: 33 },
      ],
    },
    reports: {
      pending: 3,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(listingsApiModule, 'useSearchListingsQuery').mockReturnValue({
      data: {
        results: [],
        data: [],
        meta: { page: 1, limit: 50, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminDashboardApiModule, 'useGetActivityAnalyticsQuery').mockReturnValue({
      data: {
        period: '30d',
        startDate: '2026-08-27T00:00:00.000Z',
        endDate: '2026-09-26T00:00:00.000Z',
        userSignups: [{ date: '2026-09-01', count: 5 }],
        listingCreations: [{ date: '2026-09-02', count: 3 }],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders admin dashboard page with live metrics and admin verified status', () => {
    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_admin_1',
        idToken: 'mock-admin-token',
      })
    );
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminDashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    expect(screen.getByText('Platform Administration')).toBeInTheDocument();
    expect(screen.getByText(/Super Admin/i)).toBeInTheDocument();
    expect(screen.getByText('Admin Role Verified')).toBeInTheDocument();

    // Verify Overview KPI Cards render
    expect(screen.getAllByText('154')[0]).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getAllByText('3')[0]).toBeInTheDocument();
    expect(screen.getByText('Action Required')).toBeInTheDocument();

    // Verify analytics section renders
    expect(screen.getByText('Platform Analytics & Performance')).toBeInTheDocument();
    expect(screen.getByTestId('admin-analytics')).toBeInTheDocument();
  });

  it('renders skeleton cards when overview metrics are loading', () => {
    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminDashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('admin-overview-skeletons')).toBeInTheDocument();
  });

  it('renders error alert with retry button when metrics query fails', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminDashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('metrics-error-banner')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('triggers refetch when clicking the header Refresh button', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminDashboardPage />
      </Provider>
    );

    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
