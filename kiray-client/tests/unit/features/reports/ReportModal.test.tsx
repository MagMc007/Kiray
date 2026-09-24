import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ReportModal, REPORT_REASONS } from '@/features/reports/components/ReportModal';
import { setCurrentUser, setStatus } from '@/features/auth/authSlice';
import * as reportsApiModule from '@/features/reports/reportsApi';
import type { User } from '@/types/user';
import type { Listing } from '@/types/listing';

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/bole-luxury-villa',
}));

describe('ReportModal Component', () => {
  const mockListing: Listing = {
    _id: 'listing_99',
    ownerId: 'owner_88',
    title: 'Luxury 3-Bed Villa in Bole',
    slug: 'luxury-3-bed-villa-in-bole',
    description: 'Exclusive villa',
    price: 65000,
    currency: 'ETB',
    propertyType: 'villa',
    bedrooms: 3,
    bathrooms: 3,
    areaUnit: 'sqm',
    amenities: ['wifi'],
    images: [],
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false or listing is null', () => {
    const store = makeStore();
    const { container, rerender } = render(
      <Provider store={store}>
        <ReportModal listing={mockListing} isOpen={false} onClose={vi.fn()} />
      </Provider>
    );

    expect(container.firstChild).toBeNull();

    rerender(
      <Provider store={store}>
        <ReportModal listing={null} isOpen={true} onClose={vi.fn()} />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders sign-in prompt when user is not authenticated', () => {
    const store = makeStore();
    const handleClose = vi.fn();

    render(
      <Provider store={store}>
        <ReportModal listing={mockListing} isOpen={true} onClose={handleClose} />
      </Provider>
    );

    expect(screen.getByText('Sign in to Report This Listing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In \/ Register/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders report form with all reasons when authenticated', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    render(
      <Provider store={store}>
        <ReportModal listing={mockListing} isOpen={true} onClose={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText('Report Suspicious Listing')).toBeInTheDocument();
    expect(screen.getByText('Luxury 3-Bed Villa in Bole')).toBeInTheDocument();

    REPORT_REASONS.forEach((reason) => {
      expect(screen.getByText(reason)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Submit Report/i })).toBeInTheDocument();
  });

  it('submits report with selected reason and optional details', async () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    const mockFlagListing = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ _id: 'listing_99', isFlagged: true }),
    });

    vi.spyOn(reportsApiModule, 'useFlagListingMutation').mockReturnValue([
      mockFlagListing,
      { isLoading: false, isSuccess: false, isError: false, reset: vi.fn() } as unknown as any,
    ]);

    const handleClose = vi.fn();

    render(
      <Provider store={store}>
        <ReportModal listing={mockListing} isOpen={true} onClose={handleClose} />
      </Provider>
    );

    // Select a different reason
    const secondReason = REPORT_REASONS[1];
    const radio = screen.getByDisplayValue(secondReason);
    fireEvent.click(radio);

    // Enter optional details
    const textarea = screen.getByLabelText(/Additional Details/i);
    fireEvent.change(textarea, {
      target: { value: 'Broker asked for 5,000 ETB fee over phone.' },
    });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    expect(mockFlagListing).toHaveBeenCalledWith({
      listingId: 'listing_99',
      reason: `${secondReason} - Broker asked for 5,000 ETB fee over phone.`,
    });

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Report Received')).toBeInTheDocument();
    });
  });

  it('closes on Escape key press or close button click', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    const handleClose = vi.fn();

    render(
      <Provider store={store}>
        <ReportModal listing={mockListing} isOpen={true} onClose={handleClose} />
      </Provider>
    );

    const closeBtn = screen.getByLabelText(/Close report modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
