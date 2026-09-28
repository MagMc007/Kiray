import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { LoginForm } from '@/features/auth/components/LoginForm';
import * as firebaseModule from '@/features/auth/firebase';

const mockTriggerGetMe = vi.fn();
const mockSyncUser = vi.fn();

vi.mock('@/features/auth/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/authApi')>();
  return {
    ...actual,
    useLazyGetMeQuery: () => [mockTriggerGetMe],
    useSyncUserMutation: () => [mockSyncUser],
  };
});

describe('LoginForm component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockTriggerGetMe.mockReturnValue({
      unwrap: () => Promise.resolve({ _id: 'user_123', role: 'landlord' }),
    });
    mockSyncUser.mockReturnValue({
      unwrap: () => Promise.resolve({ _id: 'user_123', role: 'rentee' }),
    });
  });

  const renderComponent = (props = {}) => {
    const store = makeStore();
    return render(
      <Provider store={store}>
        <LoginForm {...props} />
      </Provider>
    );
  };

  it('renders email input, password input, and Google sign-in button', () => {
    renderComponent();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();

    // Confirm third-party providers like Facebook are NOT present
    expect(screen.queryByText(/continue with facebook/i)).toBeNull();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('calls loginWithEmail on valid form submit', async () => {
    const loginMock = vi.spyOn(firebaseModule, 'loginWithEmail').mockResolvedValue({} as unknown as never);
    const onSuccess = vi.fn();

    renderComponent({ onSuccess });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'securepassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('user@example.com', 'securepassword');
    });
  });

  it('calls loginWithGoogle on Google button click', async () => {
    const googleMock = vi.spyOn(firebaseModule, 'loginWithGoogle').mockResolvedValue({} as unknown as never);
    const onSuccess = vi.fn();

    renderComponent({ onSuccess });

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(googleMock).toHaveBeenCalled();
    });
  });

  it('opens ForgotPasswordModal when clicking Forgot password button', () => {
    renderComponent();

    const forgotBtn = screen.getByRole('button', { name: /forgot password\?/i });
    expect(forgotBtn).toBeInTheDocument();

    fireEvent.click(forgotBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });
});
