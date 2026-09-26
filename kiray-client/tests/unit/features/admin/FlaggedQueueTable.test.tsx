import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FlaggedQueueTable } from '@/features/admin/moderation/components/FlaggedQueueTable';
import type { FlaggedListing } from '@/types/admin';

describe('FlaggedQueueTable Component', () => {
  const mockFlaggedListings: FlaggedListing[] = [
    {
      _id: 'flagged_1',
      title: 'Bole Olympia Furnished Apartment',
      slug: 'bole-olympia-furnished-apartment',
      description: 'Modern property',
      price: 55000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaUnit: 'sqm',
      amenities: ['wifi', 'security'],
      location: { type: 'Point', coordinates: [38.76, 9.0] },
      address: { street: 'Olympia St', city: 'Addis Ababa', neighborhood: 'Bole' },
      images: [{ url: 'https://example.com/olympia.jpg', publicId: 'oly1', order: 0 }],
      status: 'open',
      isFlagged: true,
      flagReason: 'Fake phone number on photos',
      pendingReportCount: 4,
      ownerId: {
        _id: 'owner_99',
        displayName: 'Solomon Kebede',
        email: 'solomon@example.com',
        role: 'landlord',
        status: 'active',
      },
      viewCount: 45,
      saveCount: 12,
      contactClickCount: 8,
      averageRating: 0,
      totalComments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders table headers and row with pending reports badge and action buttons', () => {
    const handleInspect = vi.fn();
    const handleResolve = vi.fn();

    render(
      <FlaggedQueueTable
        listings={mockFlaggedListings}
        onInspectReports={handleInspect}
        onResolveFlags={handleResolve}
      />
    );

    expect(screen.getByText('Bole Olympia Furnished Apartment')).toBeInTheDocument();
    expect(screen.getByText('Solomon Kebede')).toBeInTheDocument();
    expect(screen.getByText('Fake phone number on photos')).toBeInTheDocument();
    expect(screen.getByTestId('pending-reports-badge-flagged_1')).toHaveTextContent('4');

    fireEvent.click(screen.getByTestId('inspect-reports-btn-flagged_1'));
    expect(handleInspect).toHaveBeenCalledWith(mockFlaggedListings[0]);

    fireEvent.click(screen.getByTestId('resolve-flags-btn-flagged_1'));
    expect(handleResolve).toHaveBeenCalledWith(mockFlaggedListings[0]);
  });

  it('renders empty clean state when no listings are flagged', () => {
    render(
      <FlaggedQueueTable
        listings={[]}
        onInspectReports={vi.fn()}
        onResolveFlags={vi.fn()}
      />
    );

    expect(screen.getByTestId('flagged-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Moderation Queue is Clean!')).toBeInTheDocument();
  });
});
