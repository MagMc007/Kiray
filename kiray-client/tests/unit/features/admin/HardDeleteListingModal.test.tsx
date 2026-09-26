import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { HardDeleteListingModal } from '@/features/admin/listings/components/HardDeleteListingModal';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { Listing } from '@/types/listing';

describe('HardDeleteListingModal Component', () => {
  const mockListing: Listing = {
    _id: 'listing_hard_del_1',
    ownerId: 'owner_1',
    title: 'Modern Bole Penthouse',
    slug: 'modern-bole-penthouse',
    description: 'Luxury penthouse',
    price: 60000,
    currency: 'ETB',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaUnit: 'sqm',
    amenities: ['wifi', 'security'],
    location: { type: 'Point', coordinates: [38.76, 9.02] },
    address: { street: 'Atlas Rd', city: 'Addis Ababa', neighborhood: 'Bole Atlas' },
    images: [{ url: 'https://example.com/p1.jpg', publicId: 'p1', order: 0 }],
    status: 'open',
    viewCount: 20,
    saveCount: 5,
    contactClickCount: 2,
    averageRating: 5,
    totalComments: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockHardDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHardDelete.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true }),
    });

    vi.spyOn(adminListingApiModule, 'useHardDeleteListingMutation').mockReturnValue([
      mockHardDelete,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal with listing title and warns about irreversible destruction', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <HardDeleteListingModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    expect(screen.getByText('Permanently Delete Listing')).toBeInTheDocument();
    expect(screen.getByText(/"Modern Bole Penthouse"/)).toBeInTheDocument();
    expect(screen.getByTestId('hard-delete-confirm-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-hard-delete-btn')).toBeDisabled();
  });

  it('keeps button disabled when confirmation input does not match "DELETE"', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <HardDeleteListingModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    const input = screen.getByTestId('hard-delete-confirm-input');
    fireEvent.change(input, { target: { value: 'del' } });

    expect(screen.getByTestId('confirm-hard-delete-btn')).toBeDisabled();
  });

  it('enables button and performs deletion when "DELETE" is entered', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <HardDeleteListingModal
          isOpen={true}
          onClose={handleClose}
          listing={mockListing}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    const input = screen.getByTestId('hard-delete-confirm-input');
    fireEvent.change(input, { target: { value: 'DELETE' } });

    const deleteBtn = screen.getByTestId('confirm-hard-delete-btn');
    expect(deleteBtn).not.toBeDisabled();

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockHardDelete).toHaveBeenCalledWith('listing_hard_del_1');
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('displays error message when hard delete API mutation rejects', async () => {
    mockHardDelete.mockReturnValue({
      unwrap: () => Promise.reject({ data: { message: 'Database integrity check failed' } }),
    });

    const store = makeStore();
    render(
      <Provider store={store}>
        <HardDeleteListingModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    const input = screen.getByTestId('hard-delete-confirm-input');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByTestId('confirm-hard-delete-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('hard-delete-error')).toHaveTextContent(
        'Database integrity check failed'
      );
    });
  });
});
