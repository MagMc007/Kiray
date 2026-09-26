import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminUsersPage from '@/app/admin/users/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';
import * as adminUserApiModule from '@/features/admin/users/adminUserApi';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/users',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminUsersPage Integration', () => {
  const mockAdmin: User = {
    _id: 'admin_1',
    email: 'admin@kiray.et',
    displayName: 'Chief Administrator',
    role: 'admin',
    status: 'active',
    firebaseUid: 'fb_admin_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUsersList: User[] = [
    mockAdmin,
    {
      _id: 'user_u2',
      firebaseUid: 'fb_u2',
      displayName: 'Tewodros Kassahun',
      email: 'teddy@example.com',
      phone: '+251911998877',
      role: 'landlord',
      status: 'active',
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 154, active: 148, suspended: 4, banned: 2, byRole: { landlord: 52, rentee: 98, admin: 4 } },
        listings: { total: 96, active: 88, flagged: 4 },
        reports: { pending: 3 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminUserApiModule, 'useListUsersQuery').mockReturnValue({
      data: {
        users: mockUsersList,
        meta: { page: 1, limit: 15, total: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders the complete admin users management page with header, nav, and user table', () => {
    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_admin_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminUsersPage />
      </Provider>
    );

    expect(screen.getByTestId('admin-users-page')).toBeInTheDocument();
    expect(screen.getByText('Platform Administration')).toBeInTheDocument();
    expect(screen.getAllByText(/Chief Administrator/i)[0]).toBeInTheDocument();
    expect(screen.getByTestId('admin-header-nav')).toBeInTheDocument();
    expect(screen.getByTestId('user-management-table-container')).toBeInTheDocument();

    expect(screen.getByText('Tewodros Kassahun')).toBeInTheDocument();
    expect(screen.getByText('teddy@example.com')).toBeInTheDocument();
  });
});
