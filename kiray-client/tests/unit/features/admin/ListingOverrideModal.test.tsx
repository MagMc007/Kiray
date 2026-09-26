import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ListingOverrideModal } from '@/features/admin/listings/components/ListingOverrideModal';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { Listing } from '@/types/listing';

describe('ListingOverrideModal Component', () => {
  const mockListing: Listing = {
    _id: 'listing_override_1',
    ownerId: 'owner_1',
    title: 'Cozy CMC Studio',
    slug: 'cozy-cmc-studio',
    description: 'Near light rail station',
    price: 18000,
    currency: 'ETB',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    areaUnit: 'sqm',
    amenities: ['wifi'],
    location: { type: 'Point', coordinates: [38.8, 9.02] },
    address: { street: 'CMC Rd', city: 'Addis Ababa', neighborhood: 'CMC' },
    images: [{ url: 'https://example.com/cmc.jpg', publicId: 'cmc', order: 0 }],
    status: 'open',
    isVerified: false,
    isFeatured: false,
    viewCount: 15,
    saveCount: 2,
    contactClickCount: 1,
    averageRating: 4.0,
    totalComments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOverride = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOverride.mockReturnValue({
      unwrap: () => Promise.resolve({ ...mockListing, price: 20000, isVerified: true }),
    });

    vi.spyOn(adminListingApiModule, 'useOverrideListingMutation').mockReturnValue([
      mockOverride,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal pre-populated with current listing attributes', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingOverrideModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    expect(screen.getByText('Admin Listing Override')).toBeInTheDocument();
    expect(screen.getByTestId('override-title-input')).toHaveValue('Cozy CMC Studio');
    expect(screen.getByTestId('override-price-input')).toHaveValue(18000);
    expect(screen.getByTestId('override-status-select')).toHaveValue('open');
    expect(screen.getByTestId('override-description-input')).toHaveValue('Near light rail station');
    expect(screen.getByTestId('override-verified-checkbox')).not.toBeChecked();
    expect(screen.getByTestId('override-featured-checkbox')).not.toBeChecked();
  });

  it('dispatches override mutation with modified attributes upon submission', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <ListingOverrideModal
          isOpen={true}
          onClose={handleClose}
          listing={mockListing}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId('override-title-input'), {
      target: { value: 'Cozy CMC Studio [Admin Inspected]' },
    });
    fireEvent.change(screen.getByTestId('override-price-input'), {
      target: { value: '20000' },
    });
    fireEvent.change(screen.getByTestId('override-status-select'), {
      target: { value: 'rented' },
    });
    fireEvent.click(screen.getByTestId('override-verified-checkbox'));
    fireEvent.click(screen.getByTestId('override-featured-checkbox'));

    fireEvent.click(screen.getByTestId('save-override-btn'));

    await waitFor(() => {
      expect(mockOverride).toHaveBeenCalledWith({
        id: 'listing_override_1',
        body: {
          title: 'Cozy CMC Studio [Admin Inspected]',
          price: 20000,
          description: 'Near light rail station',
          status: 'rented',
          isVerified: true,
          isFeatured: true,
        },
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('displays validation error if required fields are missing or invalid', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingOverrideModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId('override-title-input'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByTestId('save-override-btn'));

    expect(screen.getByTestId('override-form-error')).toHaveTextContent('Title cannot be empty.');
    expect(mockOverride).not.toHaveBeenCalled();
  });
});
