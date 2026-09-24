import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import ListingDetailPage from '@/app/listings/[slug]/page';
import * as listingsApiModule from '@/features/listings/listingsApi';
import type { Listing } from '@/types/listing';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/sunny-apartment',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('ListingDetailPage Integration', () => {
  it('renders listing detail shell and handles missing listing gracefully', async () => {
    const store = makeStore();
    const paramsPromise = Promise.resolve({ slug: 'non-existent-listing' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <ListingDetailPage params={paramsPromise} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/listing not found/i) || screen.getByText(/browse properties/i)
      ).toBeInTheDocument();
    });
  });

  it('renders Report button and opens ReportModal when clicked', async () => {
    const mockListing: Listing = {
      _id: 'listing_bole_01',
      ownerId: 'owner_123',
      title: 'Charming 2-Bedroom in Bole',
      slug: 'charming-2-bedroom-in-bole',
      description: 'A cozy apartment',
      price: 32000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      areaUnit: 'sqm',
      amenities: ['wifi'],
      images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', publicId: 'img1', order: 0 }],
      status: 'open',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    vi.spyOn(listingsApiModule, 'useGetListingQuery').mockReturnValue({
      data: mockListing,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as any);

    vi.spyOn(listingsApiModule, 'useGetSimilarListingsQuery').mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as any);

    const store = makeStore();
    const paramsPromise = Promise.resolve({ slug: 'charming-2-bedroom-in-bole' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <ListingDetailPage params={paramsPromise} />
        </Provider>
      );
    });

    // Check that title and Report button are rendered
    expect(screen.getAllByText('Charming 2-Bedroom in Bole').length).toBeGreaterThan(0);
    const reportBtn = screen.getByRole('button', { name: /report listing/i });
    expect(reportBtn).toBeInTheDocument();

    // Click Report button to open modal
    fireEvent.click(reportBtn);

    // Modal should be opened (unauthenticated prompt or report form)
    expect(screen.getByText(/Report Suspicious Listing|Sign in to Report This Listing/i)).toBeInTheDocument();
  });
});
