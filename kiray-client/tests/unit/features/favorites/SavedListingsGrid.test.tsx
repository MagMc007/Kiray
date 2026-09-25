import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { SavedListingsGrid } from '@/features/favorites/components/SavedListingsGrid';
import * as favoritesApiModule from '@/features/favorites/favoritesApi';
import type { Listing } from '@/types/listing';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard/rentee',
}));

describe('SavedListingsGrid Component', () => {
  const mockSavedListings: Listing[] = [
    {
      _id: 'l1',
      title: 'Luxury 2BHK in Bole',
      slug: 'luxury-2bhk-bole',
      description: 'Luxury 2BHK in Bole',
      price: 45000,
      currency: 'ETB',
      propertyType: 'apartment',
      status: 'open',
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
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      areaUnit: 'sqm',
      amenities: ['furnished', 'wifi'],
      images: [{ url: 'https://images.unsplash.com/bole.jpg', publicId: 'img1', order: 0 }],
      ownerId: {
        _id: 'o1',
        displayName: 'Abebe Owner',
        phone: '+251911223344',
      } as any,
      viewCount: 10,
      saveCount: 2,
      contactClickCount: 1,
      averageRating: 4.8,
      totalComments: 3,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      _id: 'l2',
      title: 'Cozy Studio in Kazanchis',
      slug: 'cozy-studio-kazanchis',
      description: 'Cozy Studio in Kazanchis',
      price: 25000,
      currency: 'ETB',
      propertyType: 'studio',
      status: 'open',
      location: {
        type: 'Point',
        coordinates: [38.7612, 9.0182],
      },
      address: {
        street: 'Tito St',
        neighborhood: 'Kazanchis',
        city: 'Addis Ababa',
        postalCode: '1000',
      },
      bedrooms: 1,
      bathrooms: 1,
      area: 55,
      areaUnit: 'sqm',
      amenities: ['wifi', 'water_included'],
      images: [{ url: 'https://images.unsplash.com/kazanchis.jpg', publicId: 'img2', order: 0 }],
      ownerId: {
        _id: 'o2',
        displayName: 'Sara Owner',
        phone: '+251922334455',
      } as any,
      viewCount: 5,
      saveCount: 1,
      contactClickCount: 0,
      averageRating: 4.2,
      totalComments: 1,
      createdAt: '2026-02-05T00:00:00.000Z',
      updatedAt: '2026-02-05T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons while fetching saved listings', () => {
    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    const { container } = render(
      <Provider store={store}>
        <SavedListingsGrid />
      </Provider>
    );

    const animatedPulses = container.querySelectorAll('.animate-pulse');
    expect(animatedPulses.length).toBeGreaterThan(0);
  });

  it('renders empty state with browse CTA when there are no saved listings', () => {
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
    render(
      <Provider store={store}>
        <SavedListingsGrid />
      </Provider>
    );

    expect(screen.getByText(/No saved listings yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Addis Homes/i })).toBeInTheDocument();
  });

  it('renders saved listings and filters by search query', () => {
    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: {
        results: mockSavedListings,
        data: mockSavedListings,
        meta: {
          page: 1,
          limit: 12,
          totalPages: 1,
          total: 2,
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
    render(
      <Provider store={store}>
        <SavedListingsGrid />
      </Provider>
    );

    expect(screen.getByText('Luxury 2BHK in Bole')).toBeInTheDocument();
    expect(screen.getByText('Cozy Studio in Kazanchis')).toBeInTheDocument();

    // Filter by searching for "Bole"
    const searchInput = screen.getByPlaceholderText(/Search saved homes by neighborhood/i);
    fireEvent.change(searchInput, { target: { value: 'Bole' } });

    expect(screen.getByText('Luxury 2BHK in Bole')).toBeInTheDocument();
    expect(screen.queryByText('Cozy Studio in Kazanchis')).not.toBeInTheDocument();
  });

  it('handles property comparison selection and displays comparison modal', () => {
    vi.spyOn(favoritesApiModule, 'useGetSavedListingsQuery').mockReturnValue({
      data: {
        results: mockSavedListings,
        data: mockSavedListings,
        meta: {
          page: 1,
          limit: 12,
          totalPages: 1,
          total: 2,
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
    render(
      <Provider store={store}>
        <SavedListingsGrid />
      </Provider>
    );

    // Click "Compare" on the first card
    const compareButtons = screen.getAllByRole('button', { name: /Compare/i });
    fireEvent.click(compareButtons[0]);

    // Toolbar should show Compare (1/3)
    const compareToolbarBtn = screen.getByRole('button', { name: /Compare \(1\/3\)/i });
    expect(compareToolbarBtn).toBeInTheDocument();

    // Open compare modal
    fireEvent.click(compareToolbarBtn);

    expect(screen.getByRole('dialog', { name: /Property Comparison/i })).toBeInTheDocument();
    expect(screen.getByText(/Compare Properties \(1\)/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByLabelText(/Close comparison/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /Property Comparison/i })).not.toBeInTheDocument();
  });
});
