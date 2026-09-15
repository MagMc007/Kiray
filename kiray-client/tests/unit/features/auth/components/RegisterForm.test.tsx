import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import * as firebaseModule from '@/features/auth/firebase';

describe('RegisterForm component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (props = {}) => {
    const store = makeStore();
    return render(
      <Provider store={store}>
        <RegisterForm {...props} />
      </Provider>
    );
  };

  it('starts at role selection step and advances to credentials step', () => {
    renderComponent();

    expect(screen.getByText('How will you use Kiray?')).toBeInTheDocument();

    const renteeCard = screen.getByText('Register as Rentee').closest('[role="button"]');
    expect(renteeCard).not.toBeNull();
    if (renteeCard) {
      fireEvent.click(renteeCard);
    }

    expect(screen.getByText(/create your rentee account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();

    // Confirm third-party providers like Facebook are NOT present
    expect(screen.queryByText(/continue with facebook/i)).toBeNull();
  });

  it('submits registration with email and selected role', async () => {
    const registerMock = vi.spyOn(firebaseModule, 'registerWithEmail').mockResolvedValue({} as unknown as never);
    const onSuccess = vi.fn();

    renderComponent({ onSuccess });

    // Click owner role
    const ownerCard = screen.getByText('Register as Owner').closest('[role="button"]');
    if (ownerCard) {
      fireEvent.click(ownerCard);
    }

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Dawit Bekele' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'dawit@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create owner account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('dawit@example.com', 'password123');
    });
  });
});
