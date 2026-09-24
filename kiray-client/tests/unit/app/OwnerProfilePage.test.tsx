import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import OwnerProfilePage from '@/app/profile/[id]/page';
import * as userApiModule from '@/features/users/userApi';
import * as listingsApiModule from '@/features/listings/listingsApi';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/owner_123',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('OwnerProfilePage Integration', () => {
  const mockOwner: User = {
    _id: 'owner_123',
    firebaseUid: 'fb_owner_123',
    email: 'landlord@kiray.et',
    displayName: 'Almaz Ayana',
    fullName: 'Almaz Ayana Mekonnen',
    role: 'landlord',
    status: 'active',
    phone: '+251911223344',
    whatsapp: '251911223344',
    bio: 'Experienced landlord offering well-maintained residences in Bole and Kazanchis.',
    responseTime: 1,
    isVerified: true,
    profileCompleted: true,
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z',
  };

  const mockListing: Listing = {
    _id: 'listing_01',
    ownerId: 'owner_123',
    title: 'Modern Bole Penthouse',
    slug: 'modern-bole-penthouse',
    description: 'Stunning views',
    price: 45000,
    currency: 'ETB',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    areaUnit: 'sqm',
    amenities: ['wifi'],
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', publicId: 'img1', order: 0 }],
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton while profile is loading', async () => {
    vi.spyOn(userApiModule, 'useGetUserProfileQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as any);

    vi.spyOn(userApiModule, 'useGetUserListingsQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as any);

    const store = makeStore();
    const paramsPromise = Promise.resolve({ id: 'owner_123' });

    let renderedContainer: HTMLElement;
    await React.act(async () => {
      const { container } = render(
        <Provider store={store}>
          <OwnerProfilePage params={paramsPromise} />
        </Provider>
      );
      renderedContainer = container;
    });

    await waitFor(() => {
      expect(renderedContainer.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  it('handles not-found state when host profile fails to load', async () => {
    vi.spyOn(userApiModule, 'useGetUserProfileQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as any);

    vi.spyOn(userApiModule, 'useGetUserListingsQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as any);

    const store = makeStore();
    const paramsPromise = Promise.resolve({ id: 'non_existent_host' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <OwnerProfilePage params={paramsPromise} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Host Profile Not Found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse all listings/i })).toBeInTheDocument();
    });
  });

  it('renders host profile info, contact CTAs, and active listings', async () => {
    vi.spyOn(userApiModule, 'useGetUserProfileQuery').mockReturnValue({
      data: mockOwner,
      isLoading: false,
      isError: false,
    } as unknown as any);

    vi.spyOn(userApiModule, 'useGetUserListingsQuery').mockReturnValue({
      data: {
        results: [mockListing],
        data: [mockListing],
        meta: { page: 1, limit: 20, total: 1 },
      },
      isLoading: false,
    } as unknown as any);

    const trackClickMock = vi.fn().mockResolvedValue({});
    vi.spyOn(listingsApiModule, 'useTrackContactClickMutation').mockReturnValue([
      trackClickMock,
      { isLoading: false } as unknown as any,
    ]);

    const store = makeStore();
    const paramsPromise = Promise.resolve({ id: 'owner_123' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <OwnerProfilePage params={paramsPromise} />
        </Provider>
      );
    });

    // Check host details
    expect(screen.getAllByText('Almaz Ayana').length).toBeGreaterThan(0);
    expect(screen.getByText('Verified Landlord')).toBeInTheDocument();
    expect(screen.getByText(/Responds in ~1 hr/i)).toBeInTheDocument();
    expect(screen.getByText(mockOwner.bio!)).toBeInTheDocument();

    // Check contact CTAs
    const callLink = screen.getByRole('link', { name: /call \+251911223344/i });
    expect(callLink).toHaveAttribute('href', 'tel:+251911223344');

    const whatsappLink = screen.getByRole('link', { name: /chat on whatsapp/i });
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/251911223344');

    // Trigger contact action tracking
    fireEvent.click(callLink, { preventDefault: () => {} });
    expect(trackClickMock).toHaveBeenCalledWith('listing_01');

    // Check listings header and card
    expect(screen.getByText(/Available Properties by Almaz Ayana/i)).toBeInTheDocument();
    expect(screen.getByText('Modern Bole Penthouse')).toBeInTheDocument();
  });

  it('renders friendly empty state when host has no active listings', async () => {
    vi.spyOn(userApiModule, 'useGetUserProfileQuery').mockReturnValue({
      data: mockOwner,
      isLoading: false,
      isError: false,
    } as unknown as any);

    vi.spyOn(userApiModule, 'useGetUserListingsQuery').mockReturnValue({
      data: {
        results: [],
        data: [],
        meta: { page: 1, limit: 20, total: 0 },
      },
      isLoading: false,
    } as unknown as any);

    const store = makeStore();
    const paramsPromise = Promise.resolve({ id: 'owner_123' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <OwnerProfilePage params={paramsPromise} />
        </Provider>
      );
    });

    expect(screen.getByText('No active properties right now')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore all properties/i })).toBeInTheDocument();
  });
});
