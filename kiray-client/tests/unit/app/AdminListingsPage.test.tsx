import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminListingsPage from '@/app/admin/listings/page';
import { setCredentials, setCurrentUser } from '@/features/auth/authSlice';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { User } from '@/types/user';
import type { PopulatedListing } from '@/types/listing';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/listings',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminListingsPage Integration', () => {
  const mockAdmin: User = {
    _id: 'admin_1',
    email: 'admin@kiray.et',
    displayName: 'Chief Administrator',
    role: 'admin',
    status: 'active',
    firebaseUid: 'fb_admin_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockListings: PopulatedListing[] = [
    {
      _id: 'listing_page_1',
      ownerId: {
        _id: 'owner_1',
        displayName: 'Meron Tesfaye',
        email: 'meron@example.com',
      } as any,
      title: 'Old Airport Luxurious Residence',
      slug: 'old-airport-luxurious-residence',
      description: 'Quiet residential neighborhood',
      price: 75000,
      currency: 'ETB',
      propertyType: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      areaUnit: 'sqm',
      amenities: ['wifi', 'security'],
      location: { type: 'Point', coordinates: [38.74, 8.99] },
      address: { street: 'Old Airport Rd', city: 'Addis Ababa', neighborhood: 'Old Airport' },
      images: [{ url: 'https://example.com/residence.jpg', publicId: 'res1', order: 0 }],
      status: 'open',
      isVerified: true,
      isFeatured: true,
      isFlagged: false,
      viewCount: 150,
      saveCount: 45,
      contactClickCount: 19,
      averageRating: 4.9,
      totalComments: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 154, active: 148, suspended: 4, banned: 2, byRole: { landlord: 52, rentee: 98, admin: 4 } },
        listings: { total: 96, active: 88, flagged: 4 },
        reports: { pending: 3 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminListingApiModule, 'useListAdminListingsQuery').mockReturnValue({
      data: {
        listings: mockListings,
        meta: { page: 1, limit: 15, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders the complete admin listings moderation page with header, nav, and listing table', () => {
    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_admin_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminListingsPage />
      </Provider>
    );

    expect(screen.getByTestId('admin-listings-page')).toBeInTheDocument();
    expect(screen.getByText('Platform Administration')).toBeInTheDocument();
    expect(screen.getAllByText(/Chief Administrator/i)[0]).toBeInTheDocument();
    expect(screen.getByTestId('admin-header-nav')).toBeInTheDocument();
    expect(screen.getByTestId('listing-moderation-container')).toBeInTheDocument();

    expect(screen.getByText('Old Airport Luxurious Residence')).toBeInTheDocument();
    expect(screen.getByText(/Meron Tesfaye/i)).toBeInTheDocument();
  });
});
