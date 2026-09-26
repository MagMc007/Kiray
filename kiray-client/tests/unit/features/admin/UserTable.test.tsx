import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { UserTable } from '@/features/admin/users/components/UserTable';
import { setCurrentUser } from '@/features/auth/authSlice';
import * as adminUserApiModule from '@/features/admin/users/adminUserApi';
import type { User } from '@/types/user';

describe('UserTable Component', () => {
  const mockAdminSelf: User = {
    _id: 'admin_self_id',
    firebaseUid: 'fb_admin',
    displayName: 'Admin Boss',
    email: 'boss@kiray.et',
    role: 'admin',
    status: 'active',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUsersList: User[] = [
    mockAdminSelf,
    {
      _id: 'user_regular_1',
      firebaseUid: 'fb_reg_1',
      displayName: 'Kalkidan Bekele',
      email: 'kalkidan@example.com',
      phone: '+251911002233',
      role: 'landlord',
      status: 'active',
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'user_regular_2',
      firebaseUid: 'fb_reg_2',
      displayName: 'Yonas Haile',
      email: 'yonas@example.com',
      role: 'rentee',
      status: 'suspended',
      profileCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminUserApiModule, 'useListUsersQuery').mockReturnValue({
      data: {
        users: mockUsersList,
        meta: { page: 1, limit: 15, total: 3, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminUserApiModule, 'useLazyExportUserDataQuery').mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: () =>
          Promise.resolve({
            exportDate: new Date().toISOString(),
            user: mockUsersList[1],
            listings: [],
            reportsSubmitted: [],
            auditHistory: [],
          }),
      }),
      { isFetching: false } as any,
      {} as any,
    ] as any);

    vi.spyOn(adminUserApiModule, 'useDeleteUserMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false } as any,
    ]);

    vi.spyOn(adminUserApiModule, 'useRestoreUserMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false } as any,
    ]);

    vi.spyOn(adminUserApiModule, 'useGetUserDetailQuery').mockReturnValue({
      data: { user: mockUsersList[1], stats: { totalListings: 2, activeListings: 1, deletedListings: 0, reportsSubmitted: 0 } },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders user table with search, filters, and user rows', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdminSelf));

    render(
      <Provider store={store}>
        <UserTable />
      </Provider>
    );

    expect(screen.getByTestId('user-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('user-role-filter')).toBeInTheDocument();
    expect(screen.getByTestId('user-status-filter')).toBeInTheDocument();
    expect(screen.getByTestId('total-users-pill')).toHaveTextContent('3 users');

    expect(screen.getByText('Kalkidan Bekele')).toBeInTheDocument();
    expect(screen.getByText('kalkidan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Yonas Haile')).toBeInTheDocument();
  });

  it('protects currently logged-in administrator from self-demotion or self-suspension', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdminSelf));

    render(
      <Provider store={store}>
        <UserTable />
      </Provider>
    );

    // Self admin badge rendered
    expect(screen.getByTestId('admin-self-badge')).toHaveTextContent('Admin (You)');

    // For other users, change role button is available
    expect(screen.getByTestId('change-role-btn-user_regular_1')).toBeInTheDocument();

    // For self, suspend/delete buttons are omitted from the row
    expect(screen.queryByTestId('status-modal-btn-admin_self_id')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-user-btn-admin_self_id')).not.toBeInTheDocument();

    // For regular user, suspend/delete buttons are present
    expect(screen.getByTestId('status-modal-btn-user_regular_1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-user-btn-user_regular_1')).toBeInTheDocument();
  });

  it('opens detail drawer when clicking the view eye icon', async () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdminSelf));

    render(
      <Provider store={store}>
        <UserTable />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('view-detail-btn-user_regular_1'));

    await waitFor(() => {
      expect(screen.getByTestId('user-detail-drawer')).toBeInTheDocument();
    });
  });

  it('renders friendly empty state when no users are returned', () => {
    vi.spyOn(adminUserApiModule, 'useListUsersQuery').mockReturnValue({
      data: {
        users: [],
        meta: { page: 1, limit: 15, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <UserTable />
      </Provider>
    );

    expect(screen.getByTestId('user-table-empty')).toBeInTheDocument();
    expect(screen.getByText('No members found')).toBeInTheDocument();
  });
});
