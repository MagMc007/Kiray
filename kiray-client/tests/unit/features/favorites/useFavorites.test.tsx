import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { useFavorites } from '@/features/favorites/useFavorites';
import * as favoritesApiModule from '@/features/favorites/favoritesApi';
import { setCurrentUser, setStatus } from '@/features/auth/authSlice';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/listings/sample-house',
}));

describe('useFavorites Hook', () => {
  const mockUser: User = {
    _id: 'user_123',
    firebaseUid: 'fb_123',
    email: 'renter@kiray.et',
    displayName: 'Abebe Bikila',
    role: 'rentee',
    status: 'active',
    profileCompleted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockListing: Listing = {
    _id: 'listing_saved_101',
    ownerId: 'owner_1',
    title: 'Saved Apartment',
    slug: 'saved-apartment',
    description: 'Saved Apartment description',
    price: 30000,
    currency: 'ETB',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaUnit: 'sqm',
    amenities: ['wifi'],
    location: {
      type: 'Point',
      coordinates: [38.7892, 9.0015],
    },
    address: {
      street: 'Cameroon St',
      neighborhood: 'Bole',
      city: 'Addis Ababa',
      postalCode: '1000',
    },
    status: 'open',
    images: [],
    viewCount: 10,
    saveCount: 1,
    contactClickCount: 0,
    averageRating: 4.5,
    totalComments: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when unauthenticated user toggles favorite', async () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.isSaved('listing_saved_101')).toBe(false);
    expect(result.current.savedCount).toBe(0);

    let toggled: boolean | undefined;
    await act(async () => {
      toggled = await result.current.toggleFavorite('listing_saved_101');
    });

    expect(toggled).toBe(false);
    expect(mockPush).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent('/listings/sample-house')}`
    );
  });

  it('correctly reports saved status and performs unsave when authenticated', async () => {
    const mockSaveListing = vi.fn();
    const mockUnsaveListing = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });

    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: {
        results: [mockListing],
        data: [mockListing],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(favoritesApiModule, 'useSaveListingMutation').mockReturnValue([
      mockSaveListing,
      { isLoading: false },
    ] as any);

    vi.spyOn(favoritesApiModule, 'useUnsaveListingMutation').mockReturnValue([
      mockUnsaveListing,
      { isLoading: false },
    ] as any);

    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.isSaved('listing_saved_101')).toBe(true);
    expect(result.current.isSaved('listing_other')).toBe(false);
    expect(result.current.savedCount).toBe(1);

    await act(async () => {
      await result.current.toggleFavorite('listing_saved_101');
    });

    expect(mockUnsaveListing).toHaveBeenCalledWith('listing_saved_101');
  });
});
