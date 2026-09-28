import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import * as firebaseAuthHelpers from '@/features/auth/firebase';
import type { User } from '@/types/user';

const mockUser: User = {
  _id: 'user_1',
  firebaseUid: 'fb_1',
  role: 'rentee',
  displayName: 'Abebe Bikila',
  email: 'abebe@kiray.et',
  status: 'active',
  profileCompleted: true,
  phoneNumber: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ChangePasswordModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithStore = (ui: React.ReactElement, initialUser: User | null = mockUser) => {
    const store = makeStore();
    if (initialUser) {
      store.dispatch({
        type: 'auth/setCredentials',
        payload: {
          firebaseUid: initialUser.firebaseUid,
          idToken: 'mock_token',
        },
      });
      store.dispatch({
        type: 'auth/setCurrentUser',
        payload: initialUser,
      });
      store.dispatch({
        type: 'auth/setStatus',
        payload: 'authenticated',
      });
    }
    return render(<Provider store={store}>{ui}</Provider>);
  };

  it('renders password change form for password provider users', () => {
    vi.spyOn(firebaseAuthHelpers, 'getUserAuthProviders').mockReturnValue(['password']);

    renderWithStore(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('shows validation error when new password is too short', async () => {
    vi.spyOn(firebaseAuthHelpers, 'getUserAuthProviders').mockReturnValue(['password']);

    renderWithStore(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'oldPass123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when new passwords do not match', async () => {
    vi.spyOn(firebaseAuthHelpers, 'getUserAuthProviders').mockReturnValue(['password']);

    renderWithStore(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'oldPass123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newSecretPass1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'differentSecretPass2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/new passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('successfully updates password and shows success message', async () => {
    vi.spyOn(firebaseAuthHelpers, 'getUserAuthProviders').mockReturnValue(['password']);
    const updateSpy = vi.spyOn(firebaseAuthHelpers, 'changeUserPassword').mockResolvedValueOnce(undefined);

    renderWithStore(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'correctOldPass123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newSecurePassword123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newSecurePassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('correctOldPass123', 'newSecurePassword123');
      expect(screen.getByText(/password changed successfully!/i)).toBeInTheDocument();
    });
  });

  it('renders Google provider notice and sends setup link for Google-only users', async () => {
    vi.spyOn(firebaseAuthHelpers, 'getUserAuthProviders').mockReturnValue(['google.com']);
    const sendResetSpy = vi.spyOn(firebaseAuthHelpers, 'sendResetPasswordEmail').mockResolvedValueOnce(undefined);

    renderWithStore(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Google Account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send password setup link/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /send password setup link/i }));

    await waitFor(() => {
      expect(sendResetSpy).toHaveBeenCalledWith('abebe@kiray.et');
      expect(screen.getByText(/password reset link sent!/i)).toBeInTheDocument();
    });
  });
});
