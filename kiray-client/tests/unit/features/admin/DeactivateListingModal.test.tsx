import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { DeactivateListingModal } from '@/features/admin/listings/components/DeactivateListingModal';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { Listing } from '@/types/listing';

describe('DeactivateListingModal Component', () => {
  const mockListing: Listing = {
    _id: 'listing_mod_1',
    ownerId: 'owner_1',
    title: 'Spacious Bole 3-Bed Villa',
    slug: 'spacious-bole-3-bed-villa',
    description: 'Lovely villa in Bole',
    price: 45000,
    currency: 'ETB',
    propertyType: 'villa',
    bedrooms: 3,
    bathrooms: 2,
    areaUnit: 'sqm',
    amenities: ['wifi', 'parking'],
    location: { type: 'Point', coordinates: [38.75, 9.01] },
    address: { street: 'Main St', city: 'Addis Ababa', neighborhood: 'Bole' },
    images: [{ url: 'https://example.com/img1.jpg', publicId: 'img1', order: 0 }],
    status: 'open',
    viewCount: 10,
    saveCount: 3,
    contactClickCount: 1,
    averageRating: 4.5,
    totalComments: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockDeactivate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeactivate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...mockListing, deactivatedByAdmin: true }),
    });

    vi.spyOn(adminListingApiModule, 'useDeactivateListingMutation').mockReturnValue([
      mockDeactivate,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal with listing title and required reason field', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <DeactivateListingModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    expect(screen.getByText('Takedown Rental Listing')).toBeInTheDocument();
    expect(screen.getByText('Spacious Bole 3-Bed Villa')).toBeInTheDocument();
    expect(screen.getByTestId('deactivate-reason-input')).toBeInTheDocument();
  });

  it('enforces required takedown reason before submitting', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <DeactivateListingModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('confirm-deactivate-btn'));

    expect(
      screen.getByText(/An administrative takedown reason is required/i)
    ).toBeInTheDocument();
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it('submits deactivation with reason and triggers onSuccess callback', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <DeactivateListingModal
          isOpen={true}
          onClose={handleClose}
          listing={mockListing}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId('deactivate-reason-input'), {
      target: { value: 'Verified scam complaint from prospective renter' },
    });

    fireEvent.click(screen.getByTestId('confirm-deactivate-btn'));

    await waitFor(() => {
      expect(mockDeactivate).toHaveBeenCalledWith({
        id: 'listing_mod_1',
        reason: 'Verified scam complaint from prospective renter',
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
