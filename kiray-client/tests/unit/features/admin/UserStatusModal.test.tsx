import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { UserStatusModal } from '@/features/admin/users/components/UserStatusModal';
import * as adminUserApiModule from '@/features/admin/users/adminUserApi';
import type { User } from '@/types/user';

describe('UserStatusModal Component', () => {
  const mockUser: User = {
    _id: 'user_123',
    firebaseUid: 'fb_123',
    displayName: 'Abebe Bikila',
    email: 'abebe@example.com',
    role: 'landlord',
    status: 'active',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ ...mockUser, status: 'suspended' }),
    });

    vi.spyOn(adminUserApiModule, 'useUpdateUserStatusMutation').mockReturnValue([
      mockUpdateStatus,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal with user information and status options when open', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserStatusModal
          isOpen={true}
          onClose={vi.fn()}
          user={mockUser}
        />
      </Provider>
    );

    expect(screen.getByText('Update Account Status')).toBeInTheDocument();
    expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();
    expect(screen.getByText('abebe@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('status-option-active')).toBeInTheDocument();
    expect(screen.getByTestId('status-option-suspended')).toBeInTheDocument();
    expect(screen.getByTestId('status-option-banned')).toBeInTheDocument();
  });

  it('enforces required reason when selecting suspended status', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <UserStatusModal
          isOpen={true}
          onClose={vi.fn()}
          user={mockUser}
        />
      </Provider>
    );

    // Click suspended option
    fireEvent.click(screen.getByTestId('status-option-suspended'));

    // Attempt submitting without reason
    fireEvent.click(screen.getByTestId('save-status-button'));

    expect(
      screen.getByText(/A reason is required when placing an account in suspended status/i)
    ).toBeInTheDocument();
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('submits mutation when valid reason is provided for suspension', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <UserStatusModal
          isOpen={true}
          onClose={handleClose}
          user={mockUser}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('status-option-suspended'));
    fireEvent.change(screen.getByTestId('status-reason-input'), {
      target: { value: 'Suspicious fake rental posting detected' },
    });

    fireEvent.click(screen.getByTestId('save-status-button'));

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        id: 'user_123',
        status: 'suspended',
        reason: 'Suspicious fake rental posting detected',
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
