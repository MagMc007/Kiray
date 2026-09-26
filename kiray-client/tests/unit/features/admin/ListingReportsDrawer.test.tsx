import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { ListingReportsDrawer } from '@/features/admin/moderation/components/ListingReportsDrawer';
import * as adminModerationApiModule from '@/features/admin/moderation/adminModerationApi';

describe('ListingReportsDrawer Component', () => {
  const mockListingId = 'listing_reports_123';

  const mockReportsData = {
    listing: {
      _id: mockListingId,
      title: 'Kazanchis Executive Suite',
      slug: 'kazanchis-executive-suite',
      isFlagged: true,
      flagReason: 'Illegal broker fees requested',
    },
    reports: [
      {
        _id: 'rep_1',
        listingId: mockListingId,
        reporterId: {
          _id: 'user_rep_1',
          displayName: 'Abebe Bikila',
          email: 'abebe@example.com',
          role: 'rentee',
        },
        reason: 'Misleading price',
        notes: 'Asked for 10% cash before viewing the house',
        status: 'pending' as const,
        createdAt: '2026-09-26T10:00:00.000Z',
      },
    ],
    meta: {
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminModerationApiModule, 'useGetListingFlagsQuery').mockReturnValue({
      data: mockReportsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders reports list with reporter information and reason', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ListingReportsDrawer
          isOpen={true}
          onClose={vi.fn()}
          listingId={mockListingId}
          onOpenResolveModal={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Safety & Compliance Reports')).toBeInTheDocument();
    expect(screen.getByText('Kazanchis Executive Suite')).toBeInTheDocument();
    expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();
    expect(screen.getByText('Misleading price')).toBeInTheDocument();
    expect(
      screen.getByText(/Asked for 10% cash before viewing the house/i)
    ).toBeInTheDocument();
  });

  it('triggers onOpenResolveModal from the drawer footer button', () => {
    const handleClose = vi.fn();
    const handleOpenResolve = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <ListingReportsDrawer
          isOpen={true}
          onClose={handleClose}
          listingId={mockListingId}
          onOpenResolveModal={handleOpenResolve}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('drawer-resolve-flags-btn'));
    expect(handleClose).toHaveBeenCalled();
    expect(handleOpenResolve).toHaveBeenCalledWith(mockReportsData.listing);
  });
});
