import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { setCredentials, setCurrentUser, setStatus, logout } from '@/features/auth/authSlice';
import type { User } from '@/types/user';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => '/dashboard/landlord',
}));

describe('AuthGuard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renteeUser: User = {
    _id: 'user_rentee',
    firebaseUid: 'fb_rentee',
    role: 'rentee',
    status: 'active',
    displayName: 'Rentee User',
    email: 'rentee@example.com',
    profileCompleted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const landlordUser: User = {
    _id: 'user_landlord',
    firebaseUid: 'fb_landlord',
    role: 'landlord',
    status: 'active',
    displayName: 'Landlord User',
    email: 'landlord@example.com',
    profileCompleted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const adminUser: User = {
    _id: 'user_admin',
    firebaseUid: 'fb_admin',
    role: 'admin',
    status: 'active',
    displayName: 'Admin User',
    email: 'admin@example.com',
    profileCompleted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders loading state when auth status is loading', () => {
    const store = makeStore();
    store.dispatch(setStatus('loading'));

    render(
      <Provider store={store}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('auth-guard-loading')).toBeInTheDocument();
    expect(screen.getByText(/verifying session/i)).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    const store = makeStore();
    store.dispatch(logout());

    render(
      <Provider store={store}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </Provider>
    );

    expect(pushMock).toHaveBeenCalledWith('/login?redirect=%2Fdashboard%2Flandlord');
  });

  it('renders children when authenticated and no specific role required', () => {
    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_123', idToken: 'token_123' }));
    store.dispatch(setCurrentUser(renteeUser));

    render(
      <Provider store={store}>
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('denies access if user lacks requiredRole', () => {
    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_123', idToken: 'token_123' }));
    store.dispatch(setCurrentUser(renteeUser));

    render(
      <Provider store={store}>
        <AuthGuard requiredRole="landlord">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('auth-guard-unauthorized')).toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('allows access when user matches requiredRole', () => {
    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_landlord', idToken: 'token_123' }));
    store.dispatch(setCurrentUser(landlordUser));

    render(
      <Provider store={store}>
        <AuthGuard requiredRole="landlord">
          <div data-testid="landlord-content">Landlord Exclusive</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('landlord-content')).toBeInTheDocument();
  });

  it('enforces adminOnly guard strictly', () => {
    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_landlord', idToken: 'token_123' }));
    store.dispatch(setCurrentUser(landlordUser));

    const { rerender } = render(
      <Provider store={store}>
        <AuthGuard adminOnly>
          <div data-testid="admin-content">Admin Panel</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('auth-guard-unauthorized')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).toBeNull();

    // Now log in as Admin
    store.dispatch(setCurrentUser(adminUser));
    rerender(
      <Provider store={store}>
        <AuthGuard adminOnly>
          <div data-testid="admin-content">Admin Panel</div>
        </AuthGuard>
      </Provider>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
