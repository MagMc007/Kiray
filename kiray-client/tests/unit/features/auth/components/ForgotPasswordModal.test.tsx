import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import * as firebaseAuthHelpers from '@/features/auth/firebase';

describe('ForgotPasswordModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with email input and submit button when isOpen is true', () => {
    render(<ForgotPasswordModal isOpen={true} onClose={vi.fn()} defaultEmail="user@kiray.et" />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue('user@kiray.et');
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    render(<ForgotPasswordModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('submits email and displays success state', async () => {
    const sendSpy = vi.spyOn(firebaseAuthHelpers, 'sendResetPasswordEmail').mockResolvedValueOnce(undefined);
    const onClose = vi.fn();

    render(<ForgotPasswordModal isOpen={true} onClose={onClose} defaultEmail="test@kiray.et" />);

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(sendSpy).toHaveBeenCalledWith('test@kiray.et');
      expect(screen.getByText(/password reset link sent/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /back to login/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays error message when sendResetPasswordEmail rejects', async () => {
    vi.spyOn(firebaseAuthHelpers, 'sendResetPasswordEmail').mockRejectedValueOnce({
      code: 'auth/user-not-found',
      message: 'User not found',
    });

    render(<ForgotPasswordModal isOpen={true} onClose={vi.fn()} defaultEmail="unknown@kiray.et" />);

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/no account found with this email/i)).toBeInTheDocument();
    });
  });
});
