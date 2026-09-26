import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ResolveFlagModal } from '@/features/admin/moderation/components/ResolveFlagModal';
import * as adminModerationApiModule from '@/features/admin/moderation/adminModerationApi';
import type { FlaggedListingSummary } from '@/types/admin';

describe('ResolveFlagModal Component', () => {
  const mockListing: FlaggedListingSummary = {
    _id: 'listing_flag_1',
    title: 'Suspicious 3-Bed Bole Apartment',
    slug: 'suspicious-3-bed-bole-apartment',
    isFlagged: true,
    flagReason: 'Extortionate broker deposit demands',
  };

  const mockResolve = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolve.mockReturnValue({
      unwrap: () => Promise.resolve({ ...mockListing, isFlagged: false }),
    });

    vi.spyOn(adminModerationApiModule, 'useResolveListingFlagsMutation').mockReturnValue([
      mockResolve,
      { isLoading: false } as any,
    ]);
  });

  it('renders modal with listing title and resolution action options', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ResolveFlagModal
          isOpen={true}
          onClose={vi.fn()}
          listing={mockListing}
        />
      </Provider>
    );

    expect(screen.getByText('Resolve Listing Flags')).toBeInTheDocument();
    expect(screen.getByText('Suspicious 3-Bed Bole Apartment')).toBeInTheDocument();
    expect(screen.getByTestId('action-dismiss')).toBeInTheDocument();
    expect(screen.getByTestId('action-deactivate')).toBeInTheDocument();
    expect(screen.getByTestId('action-restore')).toBeInTheDocument();
    expect(screen.getByTestId('resolve-notes-input')).toBeInTheDocument();
  });

  it('submits resolution with default dismiss action and notes', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <ResolveFlagModal
          isOpen={true}
          onClose={handleClose}
          listing={mockListing}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId('resolve-notes-input'), {
      target: { value: 'Verified landlord identity and pricing deed.' },
    });

    fireEvent.click(screen.getByTestId('confirm-resolve-btn'));

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith({
        id: 'listing_flag_1',
        action: 'dismiss',
        notes: 'Verified landlord identity and pricing deed.',
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('allows switching action to deactivate and submitting', async () => {
    const handleClose = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <ResolveFlagModal
          isOpen={true}
          onClose={handleClose}
          listing={mockListing}
        />
      </Provider>
    );

    // Switch to deactivate
    fireEvent.click(screen.getByTestId('action-deactivate'));
    fireEvent.click(screen.getByTestId('confirm-resolve-btn'));

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith({
        id: 'listing_flag_1',
        action: 'deactivate',
        notes: undefined,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
