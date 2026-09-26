import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AdminLogoutButton } from '@/features/admin/shared/components/AdminLogoutButton';
import * as firebaseAuth from '@/features/auth/firebase';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AdminLogoutButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders log out button with label and icon', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminLogoutButton />
      </Provider>
    );

    const btn = screen.getByTestId('admin-logout-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Log Out');
  });

  it('calls logoutFirebase, dispatches store reset, and redirects to /login on click', async () => {
    const spyLogout = vi.spyOn(firebaseAuth, 'logoutFirebase').mockResolvedValue(undefined as never);
    const store = makeStore();

    render(
      <Provider store={store}>
        <AdminLogoutButton />
      </Provider>
    );

    const btn = screen.getByTestId('admin-logout-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(spyLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
