import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { UserRoleModal } from '@/features/admin/users/components/UserRoleModal';
import * as adminUserApiModule from '@/features/admin/users/adminUserApi';
import type { User } from '@/types/user';

describe('UserRoleModal Component', () => {
  const mockUser: User = {
    _id: 'user_456',
    firebaseUid: 'fb_456',
    displayName: 'Sara Tadesse',
    email: 'sara@example.com',
    role: 'rentee',
    status: 'active',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUpdateRole = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateRole.mockReturnValue({
      unwrap: () => Promise.resolve({ ...mockUser, role: 'landlord' }),
    });

    vi.spyOn(adminUserApiModule, 'useUpdateUserRoleMutation').mockReturnValue([
      mockUpdateRole,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal with role options and current role badge', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserRoleModal
          isOpen={true}
          onClose={vi.fn()}
          user={mockUser}
        />
      </Provider>
    );

    expect(screen.getByText('Change User Role')).toBeInTheDocument();
    expect(screen.getByText('Sara Tadesse')).toBeInTheDocument();
    expect(screen.getByText('Current: rentee')).toBeInTheDocument();
    expect(screen.getByTestId('role-option-rentee')).toBeInTheDocument();
    expect(screen.getByTestId('role-option-landlord')).toBeInTheDocument();
    expect(screen.getByTestId('role-option-admin')).toBeInTheDocument();
  });

  it('shows elevated privilege warning when selecting admin role', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserRoleModal
          isOpen={true}
          onClose={vi.fn()}
          user={mockUser}
        />
      </Provider>
    );

    expect(screen.queryByText(/Elevated Privilege Warning/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('role-option-admin'));

    expect(screen.getByText(/Elevated Privilege Warning/i)).toBeInTheDocument();
  });

  it('submits role change mutation when new role is selected', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <UserRoleModal
          isOpen={true}
          onClose={handleClose}
          user={mockUser}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('role-option-landlord'));
    fireEvent.click(screen.getByTestId('save-role-button'));

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith({
        id: 'user_456',
        role: 'landlord',
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
