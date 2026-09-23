import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import EditListingPage from '@/app/dashboard/landlord/listings/[id]/edit/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import * as listingsApiModule from '@/features/listings/listingsApi';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/landlord/listings/l_123/edit',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/features/map/components/MapboxView', () => ({
  MapboxView: () => <div data-testid="mock-mapbox">Mapbox Mock</div>,
}));

describe('EditListingPage Integration', () => {
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

  const sampleListing: Listing = {
    _id: 'l_123',
    ownerId: 'u_ll_1',
    title: 'Luxury Villa in Old Airport',
    slug: 'luxury-villa-in-old-airport',
    description: 'Beautiful large home',
    price: 90000,
    currency: 'ETB',
    propertyType: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    areaUnit: 'sqm',
    amenities: ['wifi', 'parking', 'pool'],
    location: { type: 'Point', coordinates: [38.74, 8.99] },
    address: { street: 'Old Airport St', city: 'Addis Ababa', neighborhood: 'Old Airport' },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
        publicId: 'sample1',
        order: 0,
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
        publicId: 'sample2',
        order: 1,
      },
    ],
    status: 'open',
    viewCount: 150,
    saveCount: 12,
    contactClickCount: 9,
    averageRating: 5.0,
    totalComments: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders breadcrumbs and pre-populated ListingForm in edit mode', async () => {
    vi.spyOn(listingsApiModule, 'useGetListingQuery').mockReturnValue({
      data: sampleListing,
      isLoading: false,
      isFetching: false,
      isError: false,
    } as any);

    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_ll_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockLandlord));

    const paramsPromise = Promise.resolve({ id: 'l_123' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <EditListingPage params={paramsPromise} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Landlord Portal')).toBeInTheDocument();
      expect(screen.getByText('Edit Property')).toBeInTheDocument();
      expect(screen.getByText('Edit Rental Listing')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Luxury Villa in Old Airport')).toBeInTheDocument();
    });
  });
});
