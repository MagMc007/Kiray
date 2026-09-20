import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import NewListingPage from '@/app/dashboard/landlord/listings/new/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/landlord/listings/new',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/features/map/components/MapboxView', () => ({
  MapboxView: () => <div data-testid="mock-mapbox">Mapbox Mock</div>,
}));

describe('NewListingPage Integration', () => {
  const mockLandlord: User = {
    _id: 'u_ll_1',
    email: 'landlord@kiray.et',
    displayName: 'Abebe Host',
    role: 'landlord',
    status: 'active',
    firebaseUid: 'fb_ll_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders breadcrumbs and listing creation form when authenticated as landlord', () => {
    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_ll_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockLandlord));

    render(
      <Provider store={store}>
        <NewListingPage />
      </Provider>
    );

    // Breadcrumbs
    expect(screen.getByText('Landlord Portal')).toBeInTheDocument();
    expect(screen.getByText('Publish Listing')).toBeInTheDocument();

    // ListingForm rendered in create mode
    expect(screen.getByText('Publish New Rental Listing')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/)).toBeInTheDocument();
  });
});
