import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ListingModerationTable } from '@/features/admin/listings/components/ListingModerationTable';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { PopulatedListing } from '@/types/listing';

describe('ListingModerationTable Component', () => {
  const mockListings: PopulatedListing[] = [
    {
      _id: 'list_row_1',
      ownerId: {
        _id: 'owner_1',
        displayName: 'Sara Solomon',
        email: 'sara@example.com',
      } as any,
      title: 'Modern Bole Apartment',
      slug: 'modern-bole-apartment',
      description: 'Fully furnished',
      price: 32000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaUnit: 'sqm',
      amenities: ['wifi'],
      location: { type: 'Point', coordinates: [38.76, 9.01] },
      address: { street: 'Bole Rd', city: 'Addis Ababa', neighborhood: 'Bole' },
      images: [{ url: 'https://example.com/img1.jpg', publicId: 'img1', order: 0 }],
      status: 'open',
      isVerified: true,
      isFeatured: false,
      isFlagged: false,
      viewCount: 40,
      saveCount: 10,
      contactClickCount: 4,
      averageRating: 4.6,
      totalComments: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'list_row_2',
      ownerId: {
        _id: 'owner_2',
        displayName: 'Yonas Haile',
        email: 'yonas@example.com',
      } as any,
      title: 'Kazanchis Commercial Suite',
      slug: 'kazanchis-commercial-suite',
      description: 'Near UNECA',
      price: 55000,
      currency: 'ETB',
      propertyType: 'condo',
      bedrooms: 0,
      bathrooms: 1,
      areaUnit: 'sqm',
      amenities: ['elevator', 'security'],
      location: { type: 'Point', coordinates: [38.77, 9.02] },
      address: { street: 'Kazanchis St', city: 'Addis Ababa', neighborhood: 'Kazanchis' },
      images: [{ url: 'https://example.com/img2.jpg', publicId: 'img2', order: 0 }],
      status: 'open',
      isVerified: false,
      isFeatured: true,
      isFlagged: true,
      flagReason: 'Duplicate listing reported',
      viewCount: 90,
      saveCount: 15,
      contactClickCount: 8,
      averageRating: 4.2,
      totalComments: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockVerify = vi.fn();
  const mockFeature = vi.fn();
  const mockRestore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerify.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mockFeature.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mockRestore.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    vi.spyOn(adminListingApiModule, 'useListAdminListingsQuery').mockReturnValue({
      data: {
        listings: mockListings,
        meta: { page: 1, limit: 15, total: 2, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminListingApiModule, 'useVerifyListingMutation').mockReturnValue([
      mockVerify,
      { isLoading: false } as any,
    ]);
    vi.spyOn(adminListingApiModule, 'useFeatureListingMutation').mockReturnValue([
      mockFeature,
      { isLoading: false } as any,
    ]);
    vi.spyOn(adminListingApiModule, 'useRestoreListingMutation').mockReturnValue([
      mockRestore,
      { isLoading: false } as any,
    ]);
  });

  it('renders listing moderation table header and listing rows', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingModerationTable />
      </Provider>
    );

    expect(screen.getByText('Listing Moderation & Direct Owner Verification')).toBeInTheDocument();
    expect(screen.getByText('Modern Bole Apartment')).toBeInTheDocument();
    expect(screen.getByText('Kazanchis Commercial Suite')).toBeInTheDocument();
    expect(screen.getByTestId('total-listings-pill')).toHaveTextContent('2 listings');
    expect(screen.getByTestId('verified-badge-list_row_1')).toBeInTheDocument();
    expect(screen.getByTestId('flagged-badge-list_row_2')).toBeInTheDocument();
  });

  it('toggles verification status when verify button is clicked', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingModerationTable />
      </Provider>
    );

    const toggleVerifyBtn = screen.getByTestId('toggle-verify-btn-list_row_2');
    fireEvent.click(toggleVerifyBtn);

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledWith({
        id: 'list_row_2',
        isVerified: true,
      });
    });
  });

  it('toggles featured status when feature button is clicked', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingModerationTable />
      </Provider>
    );

    const toggleFeatureBtn = screen.getByTestId('toggle-feature-btn-list_row_1');
    fireEvent.click(toggleFeatureBtn);

    await waitFor(() => {
      expect(mockFeature).toHaveBeenCalledWith({
        id: 'list_row_1',
        isFeatured: true,
      });
    });
  });

  it('displays empty state when listings array is empty', () => {
    vi.spyOn(adminListingApiModule, 'useListAdminListingsQuery').mockReturnValue({
      data: {
        listings: [],
        meta: { page: 1, limit: 15, total: 0, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingModerationTable />
      </Provider>
    );

    expect(screen.getByTestId('listing-table-empty')).toBeInTheDocument();
    expect(screen.getByText('No rental listings match criteria')).toBeInTheDocument();
  });
});
