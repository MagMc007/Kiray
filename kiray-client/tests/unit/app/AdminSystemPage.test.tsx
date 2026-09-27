import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminSystemPage from '@/app/admin/system/page';
import * as adminSystemApi from '@/features/admin/system/adminSystemApi';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/system',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminSystemPage Integration', () => {
  const mockRefetchHealth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 10, active: 8, suspended: 1, banned: 1, byRole: { landlord: 4, rentee: 5, admin: 1 } },
        listings: { total: 25, active: 20, flagged: 0 },
        reports: { pending: 0 },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(adminSystemApi, 'useGetHealthQuery').mockReturnValue({
      data: {
        status: 'healthy',
        uptime: 3600,
        timestamp: '2026-09-26T22:00:00.000Z',
        database: {
          status: 'connected',
          host: 'mongodb://cluster-0.kiray.net',
          name: 'kiray-production',
        },
        memory: {
          rss: 104857600,
          heapTotal: 52428800,
          heapUsed: 26214400,
          external: 1048576,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchHealth,
    } as any);

    vi.spyOn(adminSystemApi, 'usePurgeSoftDeletedMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);
  });

  const renderWithProviders = () => {
    const store = makeStore();
    return render(
      <Provider store={store}>
        <AdminSystemPage />
      </Provider>
    );
  };

  it('renders the complete admin system page with header, nav, subtabs, and all modules', () => {
    renderWithProviders();

    expect(screen.getByTestId('admin-system-page')).toBeInTheDocument();
    expect(screen.getByText('System Health & Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Engine Online')).toBeInTheDocument();

    // Check shared header nav is mounted
    expect(screen.getByTestId('admin-header-nav')).toBeInTheDocument();

    // Check subtabs
    expect(screen.getByTestId('system-subtabs')).toBeInTheDocument();
    expect(screen.getByTestId('system-tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('system-tab-health')).toBeInTheDocument();
    expect(screen.getByTestId('system-tab-maintenance')).toBeInTheDocument();

    // In 'all' view, both sections are present
    expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();
    expect(screen.getByTestId('system-maintenance-card')).toBeInTheDocument();
  });

  it('filters visible module panels based on active subtab', () => {
    renderWithProviders();

    // Switch to Health tab
    fireEvent.click(screen.getByTestId('system-tab-health'));
    expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('system-maintenance-card')).not.toBeInTheDocument();

    // Switch to Maintenance tab
    fireEvent.click(screen.getByTestId('system-tab-maintenance'));
    expect(screen.queryByTestId('system-health-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('system-maintenance-card')).toBeInTheDocument();
  });

  it('triggers refresh for health query when clicking Refresh', () => {
    renderWithProviders();

    const refreshBtn = screen.getByTestId('refresh-system-btn');
    fireEvent.click(refreshBtn);

    expect(mockRefetchHealth).toHaveBeenCalledTimes(1);
  });
});

