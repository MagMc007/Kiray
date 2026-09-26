import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { UserDetailDrawer } from '@/features/admin/users/components/UserDetailDrawer';
import * as adminUserApiModule from '@/features/admin/users/adminUserApi';
import type { User } from '@/types/user';
import type { AdminUserDetail } from '@/types/admin';

describe('UserDetailDrawer Component', () => {
  const mockUser: User = {
    _id: 'user_789',
    firebaseUid: 'fb_789',
    displayName: 'Henok Alemayehu',
    email: 'henok@example.com',
    phone: '+251911223344',
    role: 'landlord',
    status: 'active',
    isVerified: true,
    profileCompleted: true,
    bio: 'Professional real estate property manager in Bole.',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  };

  const mockDetailData: AdminUserDetail = {
    user: mockUser,
    stats: {
      totalListings: 12,
      activeListings: 10,
      deletedListings: 2,
      reportsSubmitted: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminUserApiModule, 'useGetUserDetailQuery').mockReturnValue({
      data: mockDetailData,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminUserApiModule, 'useDeleteUserMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false } as any,
    ]);

    vi.spyOn(adminUserApiModule, 'useRestoreUserMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false } as any,
    ]);
  });

  it('renders loading skeleton when fetching user details', () => {
    vi.spyOn(adminUserApiModule, 'useGetUserDetailQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <UserDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          userId="user_789"
          onOpenStatusModal={vi.fn()}
          onOpenRoleModal={vi.fn()}
          onExportData={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByTestId('user-detail-loading')).toBeInTheDocument();
  });

  it('renders user details, statistics, and bio when loaded', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          userId="user_789"
          onOpenStatusModal={vi.fn()}
          onOpenRoleModal={vi.fn()}
          onExportData={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Henok Alemayehu')).toBeInTheDocument();
    expect(screen.getByText('henok@example.com')).toBeInTheDocument();
    expect(screen.getByText('+251911223344')).toBeInTheDocument();
    expect(screen.getByText(/Professional real estate property manager in Bole/i)).toBeInTheDocument();

    // Stats
    expect(screen.getByText('12')).toBeInTheDocument(); // totalListings
    expect(screen.getByText('10')).toBeInTheDocument(); // activeListings
    expect(screen.getByText('2')).toBeInTheDocument();  // deletedListings
    expect(screen.getByText('1')).toBeInTheDocument();  // reportsSubmitted
  });

  it('triggers action callbacks when clicking status, role, and export buttons', () => {
    const onOpenStatusModal = vi.fn();
    const onOpenRoleModal = vi.fn();
    const onExportData = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <UserDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          userId="user_789"
          onOpenStatusModal={onOpenStatusModal}
          onOpenRoleModal={onOpenRoleModal}
          onExportData={onExportData}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('drawer-status-btn'));
    expect(onOpenStatusModal).toHaveBeenCalledWith(mockUser);

    fireEvent.click(screen.getByTestId('drawer-role-btn'));
    expect(onOpenRoleModal).toHaveBeenCalledWith(mockUser);

    fireEvent.click(screen.getByTestId('drawer-export-btn'));
    expect(onExportData).toHaveBeenCalledWith(mockUser);
  });

  it('disables role and status buttons when viewing self account', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          userId="user_789"
          onOpenStatusModal={vi.fn()}
          onOpenRoleModal={vi.fn()}
          onExportData={vi.fn()}
          isCurrentUserSelf={true}
        />
      </Provider>
    );

    expect(screen.getByTestId('drawer-status-btn')).toBeDisabled();
    expect(screen.getByTestId('drawer-role-btn')).toBeDisabled();
    expect(screen.getByTestId('drawer-delete-restore-btn')).toBeDisabled();
  });
});
