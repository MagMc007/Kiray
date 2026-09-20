import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import LandlordDashboardPage from '@/app/dashboard/landlord/page';
import { setCredentials, setCurrentUser, logout } from '@/features/auth/authSlice';
import * as userApiModule from '@/features/users/userApi';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/landlord',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('LandlordDashboardPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLandlord: User = {
    _id: 'u_landlord_1',
    email: 'landlord@kiray.et',
    displayName: 'Alemayehu Landlord',
    fullName: 'Alemayehu Tadesse',
    role: 'landlord',
    status: 'active',
    firebaseUid: 'fb_landlord_1',
    profileCompleted: true,
    isVerified: true,
    phone: '+251911223344',
    whatsapp: '+251922334455',
    bio: 'Experienced landlord in Bole.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleListings: Listing[] = [
    {
      _id: 'list_01',
      ownerId: 'u_landlord_1',
      title: 'Modern 2-Bedroom in Bole',
      slug: 'modern-2-bedroom-in-bole',
      description: 'Bright flat',
      price: 30000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 100,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking'],
      location: { type: 'Point', coordinates: [38.78, 9.0] },
      address: { street: 'Bole Rd', city: 'Addis Ababa', neighborhood: 'Bole' },
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
          publicId: 'sample1',
          order: 0,
        },
      ],
      status: 'open',
      viewCount: 250,
      saveCount: 30,
      contactClickCount: 12,
      averageRating: 5.0,
      totalComments: 2,
      isDeleted: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('renders landlord dashboard with metrics, tabs, and listings when authenticated', () => {
    vi.spyOn(userApiModule, 'useGetMyListingsQuery').mockReturnValue({
      data: {
        results: sampleListings,
        data: sampleListings,
        meta: {
          page: 1,
          limit: 20,
          totalPages: 1,
          total: 1,
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
        firebaseUid: 'fb_landlord_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockLandlord));

    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    // Profile & Header
    expect(screen.getByText('Alemayehu Landlord')).toBeInTheDocument();
    expect(screen.getByText(/Property Owner/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Publish New Listing/i })).toHaveAttribute(
      'href',
      '/dashboard/landlord/listings/new'
    );

    // KPI Cards
    expect(screen.getByText('250')).toBeInTheDocument(); // Views
    expect(screen.getByText('30')).toBeInTheDocument();  // Saves
    expect(screen.getByText('12')).toBeInTheDocument();  // Contacts
    expect(screen.getByText('1')).toBeInTheDocument();   // Active listing

    // Listings table content
    expect(screen.getByText('Modern 2-Bedroom in Bole')).toBeInTheDocument();
  });

  it('switches between tabs (Listings, Inquiries, Profile)', () => {
    vi.spyOn(userApiModule, 'useGetMyListingsQuery').mockReturnValue({
      data: { results: sampleListings, data: sampleListings, meta: {} },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    store.dispatch(
      setCredentials({
        firebaseUid: 'fb_landlord_1',
        idToken: 'mock-token',
      })
    );
    store.dispatch(setCurrentUser(mockLandlord));

    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    // Switch to Inquiries Tab
    const inquiriesTab = screen.getByRole('button', { name: /Renter Q&A Inquiries/i });
    fireEvent.click(inquiriesTab);
    expect(screen.getByText(/Prompt Responses Build Trust/i)).toBeInTheDocument();

    // Switch to Profile Tab
    const profileTab = screen.getByRole('button', { name: /Landlord Profile & Contact Info/i });
    fireEvent.click(profileTab);
    expect(screen.getByText(/Public Landlord Profile & Contact Numbers/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('+251911223344')).toBeInTheDocument();
  });

  it('blocks access via AuthGuard when user is unauthenticated', () => {
    const store = makeStore();
    store.dispatch(logout());

    render(
      <Provider store={store}>
        <LandlordDashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('auth-guard-unauthenticated')).toBeInTheDocument();
    expect(screen.queryByText('Alemayehu Landlord')).not.toBeInTheDocument();
  });
});
