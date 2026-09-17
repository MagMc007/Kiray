import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import RenteeDashboardPage from '@/app/dashboard/rentee/page';
import { setCredentials, setCurrentUser, logout } from '@/features/auth/authSlice';
import * as favoritesApiModule from '@/features/favorites/favoritesApi';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/rentee',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('RenteeDashboardPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRentee: User = {
    _id: 'u123',
    email: 'rentee@example.com',
    displayName: 'Dagmawi Rentee',
    role: 'rentee',
    status: 'active',
    firebaseUid: 'fb123',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders rentee dashboard shell with greeting, saved count, and grid when authenticated', () => {
    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: {
        results: [],
        data: [],
        meta: {
          page: 1,
          limit: 12,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb123',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockRentee));

    render(
      <Provider store={store}>
        <RenteeDashboardPage />
      </Provider>
    );

    expect(screen.getByText('Rentee Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Dagmawi Rentee/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Homes & Shortlist/i)).toBeInTheDocument();
    const browseLinks = screen.getAllByRole('link', { name: /Browse Addis Homes/i });
    expect(browseLinks.length).toBeGreaterThanOrEqual(1);
    expect(browseLinks[0]).toHaveAttribute('href', '/listings');
  });

  it('blocks or prompts sign in when user is unauthenticated', () => {
    const store = makeStore();
    store.dispatch(logout());

    render(
      <Provider store={store}>
        <RenteeDashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('auth-guard-unauthenticated')).toBeInTheDocument();
    expect(screen.queryByText('Saved Homes & Shortlist')).not.toBeInTheDocument();
  });
});
