import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminFlaggedPage from '@/app/admin/flagged/page';
import { setCurrentUser } from '@/features/auth/authSlice';
import * as adminModerationApiModule from '@/features/admin/moderation/adminModerationApi';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';
import type { User } from '@/types/user';
import type { FlaggedListing } from '@/types/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/flagged',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminFlaggedPage Integration', () => {
  const mockAdmin: User = {
    _id: 'admin_1',
    email: 'admin@kiray.et',
    displayName: 'Chief Safety Officer',
    role: 'admin',
    status: 'active',
    firebaseUid: 'fb_admin_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockFlaggedListings: FlaggedListing[] = [
    {
      _id: 'flag_listing_1',
      title: 'Suspicious Bole Villa',
      slug: 'suspicious-bole-villa',
      description: 'Quiet residential neighborhood',
      price: 90000,
      currency: 'ETB',
      propertyType: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      areaUnit: 'sqm',
      amenities: ['wifi'],
      location: { type: 'Point', coordinates: [38.75, 9.0] },
      address: { street: 'Main Rd', city: 'Addis Ababa', neighborhood: 'Bole' },
      images: [{ url: 'https://example.com/villa.jpg', publicId: 'v1', order: 0 }],
      status: 'open',
      isFlagged: true,
      flagReason: 'Illegal broker fee request',
      pendingReportCount: 3,
      ownerId: {
        _id: 'owner_1',
        displayName: 'Alemayehu Tadesse',
        email: 'alemayehu@example.com',
        role: 'landlord',
        status: 'active',
      },
      viewCount: 150,
      saveCount: 20,
      contactClickCount: 12,
      averageRating: 0,
      totalComments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 10, active: 8, suspended: 1, banned: 1, byRole: { landlord: 4, rentee: 5, admin: 1 } },
        listings: { total: 25, active: 20, flagged: 1 },
        reports: { pending: 3 },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminModerationApiModule, 'useGetFlaggedListingsQuery').mockReturnValue({
      data: {
        listings: mockFlaggedListings,
        meta: { page: 1, limit: 15, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminModerationApiModule, 'useGetListingFlagsQuery').mockReturnValue({
      data: {
        listing: {
          _id: 'flag_listing_1',
          title: 'Suspicious Bole Villa',
          slug: 'suspicious-bole-villa',
          isFlagged: true,
          flagReason: 'Illegal broker fee request',
        },
        reports: [
          {
            _id: 'rep_1',
            listingId: 'flag_listing_1',
            reporterId: { _id: 'u2', displayName: 'Aster Aweke', email: 'aster@example.com', role: 'rentee' },
            reason: 'Misleading price',
            notes: 'Demanded commission before viewing',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminModerationApiModule, 'useResolveListingFlagsMutation').mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) }),
      { isLoading: false } as any,
    ]);
  });

  it('renders flagged moderation queue page with title, listing row and report badge', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminFlaggedPage />
      </Provider>
    );

    expect(screen.getByText('Trust & Safety Moderation')).toBeInTheDocument();
    expect(screen.getByText('Suspicious Bole Villa')).toBeInTheDocument();
    expect(screen.getByText('Alemayehu Tadesse')).toBeInTheDocument();
    expect(screen.getByTestId('pending-reports-badge-flag_listing_1')).toHaveTextContent('3');
  });

  it('opens inspect reports drawer when Reports button is clicked', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminFlaggedPage />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('inspect-reports-btn-flag_listing_1'));
    expect(screen.getByTestId('listing-reports-drawer')).toBeInTheDocument();
    expect(screen.getByText('Safety & Compliance Reports')).toBeInTheDocument();
  });

  it('opens resolve flags modal when Resolve button is clicked', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminFlaggedPage />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('resolve-flags-btn-flag_listing_1'));
    expect(screen.getByTestId('resolve-flag-modal-form')).toBeInTheDocument();
    expect(screen.getByText('Resolve Listing Flags')).toBeInTheDocument();
  });
});
