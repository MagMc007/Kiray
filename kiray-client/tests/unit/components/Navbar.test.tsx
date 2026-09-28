import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { Navbar } from '@/components/layout/Navbar';
import { setCurrentUser, setStatus, setCredentials } from '@/features/auth/authSlice';
import type { User } from '@/types/user';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/features/auth/firebase', () => ({
  logoutFirebase: vi.fn().mockResolvedValue(undefined),
  getUserAuthProviders: vi.fn(() => ['password']),
  sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
  changeUserPassword: vi.fn().mockResolvedValue(undefined),
  auth: { currentUser: null },
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and public navigation links in unauthenticated state', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(screen.getByText('Kiray')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse Properties')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Safety Tips')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('displays favorites count when greater than 0', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Navbar favoritesCount={4} />
      </Provider>
    );

    expect(screen.getAllByText('4')[0]).toBeInTheDocument();
  });

  it('triggers onOpenAuth when clicking login or register if provided', () => {
    const store = makeStore();
    const handleAuth = vi.fn();
    render(
      <Provider store={store}>
        <Navbar onOpenAuth={handleAuth} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));
    expect(handleAuth).toHaveBeenCalledWith('login');

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(handleAuth).toHaveBeenCalledWith('register');
  });

  it('renders Landlord dashboard link and user menu when authenticated as landlord', () => {
    const landlordUser: User = {
      _id: 'user_001',
      firebaseUid: 'fb_001',
      role: 'landlord',
      status: 'active',
      displayName: 'Abebe Kebede',
      email: 'abebe@example.com',
      profileCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_001', idToken: 'token_001' }));
    store.dispatch(setCurrentUser(landlordUser));
    store.dispatch(setStatus('authenticated'));

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Abebe Kebede')).toBeInTheDocument();
    expect(screen.getByText('landlord')).toBeInTheDocument();

    // Click profile menu to open dropdown
    fireEvent.click(screen.getByText('Abebe Kebede'));
    expect(screen.getByText('abebe@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('renders Change Password for rentee role, opens modal upon click, and hides it for admin role', () => {
    // 1. Rentee role
    const renteeUser: User = {
      _id: 'user_002',
      firebaseUid: 'fb_002',
      role: 'rentee',
      status: 'active',
      displayName: 'Tigist Alemu',
      email: 'tigist@example.com',
      profileCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const renteeStore = makeStore();
    renteeStore.dispatch(setCredentials({ firebaseUid: 'fb_002', idToken: 'token_002' }));
    renteeStore.dispatch(setCurrentUser(renteeUser));
    renteeStore.dispatch(setStatus('authenticated'));

    const { unmount } = render(
      <Provider store={renteeStore}>
        <Navbar />
      </Provider>
    );

    // Open rentee dropdown
    fireEvent.click(screen.getByText('Tigist Alemu'));
    const changePassBtn = screen.getByRole('button', { name: /Change Password/i });
    expect(changePassBtn).toBeInTheDocument();

    // Click Change Password opens modal
    fireEvent.click(changePassBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    unmount();

    // 2. Admin role
    const adminUser: User = {
      _id: 'user_003',
      firebaseUid: 'fb_003',
      role: 'admin',
      status: 'active',
      displayName: 'Admin User',
      email: 'admin@kiray.et',
      profileCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const adminStore = makeStore();
    adminStore.dispatch(setCredentials({ firebaseUid: 'fb_003', idToken: 'token_003' }));
    adminStore.dispatch(setCurrentUser(adminUser));
    adminStore.dispatch(setStatus('authenticated'));

    render(
      <Provider store={adminStore}>
        <Navbar />
      </Provider>
    );

    // Open admin dropdown
    fireEvent.click(screen.getByText('Admin User'));
    expect(screen.getAllByText('Admin Console').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('button', { name: /Change Password/i })).not.toBeInTheDocument();
  });

  it('handles sign out click', async () => {
    const renteeUser: User = {
      _id: 'user_002',
      firebaseUid: 'fb_002',
      role: 'rentee',
      status: 'active',
      displayName: 'Tigist Alemu',
      email: 'tigist@example.com',
      profileCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const store = makeStore();
    store.dispatch(setCredentials({ firebaseUid: 'fb_002', idToken: 'token_002' }));
    store.dispatch(setCurrentUser(renteeUser));
    store.dispatch(setStatus('authenticated'));

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Tigist Alemu'));
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(store.getState().auth.status).toBe('unauthenticated');
      expect(store.getState().auth.currentUser).toBeNull();
    });
  });

  it('toggles mobile drawer menu on mobile burger click', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    const toggleBtn = screen.getByLabelText(/Toggle Navigation Menu/i);
    expect(toggleBtn).toBeInTheDocument();

    // Drawer should open upon click
    fireEvent.click(toggleBtn);
    expect(document.getElementById('mobile-nav-drawer')).toBeInTheDocument();
    expect(document.getElementById('mobile-nav-link-home')).toBeInTheDocument();

    // Drawer should close upon clicking again
    fireEvent.click(toggleBtn);
    expect(document.getElementById('mobile-nav-drawer')).not.toBeInTheDocument();
  });
});
