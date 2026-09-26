import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';

let mockPathname = '/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminHeaderNav Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/admin';

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 120, active: 110, suspended: 8, banned: 2, byRole: { landlord: 40, rentee: 75, admin: 5 } },
        listings: { total: 85, active: 80, flagged: 3 },
        reports: { pending: 4 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders all primary and governance navigation links', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminHeaderNav />
      </Provider>
    );

    expect(screen.getByTestId('admin-header-nav')).toBeInTheDocument();
    expect(screen.getByText('Overview & Charts')).toBeInTheDocument();
    expect(screen.getByText('Member Directory')).toBeInTheDocument();
    expect(screen.getByText('Listing Inventory')).toBeInTheDocument();
    expect(screen.getByText('Flagged Queue')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('highlights the active tab for overview when at /admin', () => {
    mockPathname = '/admin';
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminHeaderNav />
      </Provider>
    );

    const overviewLink = screen.getByTestId('admin-nav-overview');
    expect(overviewLink).toHaveClass('bg-slate-900');
    expect(overviewLink).toHaveClass('text-white');

    const usersLink = screen.getByTestId('admin-nav-users');
    expect(usersLink).not.toHaveClass('bg-slate-900');
  });

  it('highlights the active tab for users when at /admin/users', () => {
    mockPathname = '/admin/users';
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminHeaderNav />
      </Provider>
    );

    const usersLink = screen.getByTestId('admin-nav-users');
    expect(usersLink).toHaveClass('bg-slate-900');

    const overviewLink = screen.getByTestId('admin-nav-overview');
    expect(overviewLink).not.toHaveClass('bg-slate-900');
  });

  it('highlights the active tab for listings when at /admin/listings', () => {
    mockPathname = '/admin/listings';
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminHeaderNav />
      </Provider>
    );

    const listingsLink = screen.getByTestId('admin-nav-listings');
    expect(listingsLink).toHaveClass('bg-slate-900');
  });

  it('renders metric badges from query data or explicit props', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminHeaderNav userCount={250} listingCount={140} pendingReportsCount={7} />
      </Provider>
    );

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
