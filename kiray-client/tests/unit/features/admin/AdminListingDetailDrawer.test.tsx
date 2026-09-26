import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AdminListingDetailDrawer } from '@/features/admin/listings/components/AdminListingDetailDrawer';
import * as adminListingApiModule from '@/features/admin/listings/adminListingApi';
import type { PopulatedListing } from '@/types/listing';

describe('AdminListingDetailDrawer Component', () => {
  const mockPopulatedListing: PopulatedListing = {
    _id: 'listing_drawer_1',
    ownerId: {
      _id: 'user_owner_1',
      displayName: 'Abebe Kebede',
      email: 'abebe@example.com',
      phone: '+251911223344',
      isVerified: true,
    } as any,
    title: 'Luxury Bole Villa With Garden',
    slug: 'luxury-bole-villa-with-garden',
    description: 'Executive standard residence in Bole',
    price: 85000,
    currency: 'ETB',
    propertyType: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    areaUnit: 'sqm',
    amenities: ['wifi', 'parking', 'security'],
    location: { type: 'Point', coordinates: [38.78, 9.0] },
    address: { street: 'Rwanda St', city: 'Addis Ababa', neighborhood: 'Bole' },
    images: [
      { url: 'https://example.com/v1.jpg', publicId: 'v1', order: 0 },
      { url: 'https://example.com/v2.jpg', publicId: 'v2', order: 1 },
    ],
    status: 'open',
    isVerified: true,
    isFeatured: false,
    isFlagged: true,
    flagReason: 'Unregistered agent listing',
    viewCount: 120,
    saveCount: 30,
    contactClickCount: 12,
    averageRating: 4.8,
    totalComments: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockReports = [
    {
      _id: 'rep_1',
      listingId: 'listing_drawer_1',
      reporterId: { displayName: 'Tenant Dawit', email: 'dawit@example.com' },
      reason: 'Price discrepancy',
      details: 'Owner quoted a higher deposit offline',
      status: 'pending',
      createdAt: new Date().toISOString(),
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

  it('renders nothing when isOpen is false', () => {
    const store = makeStore();
    const { container } = render(
      <Provider store={store}>
        <AdminListingDetailDrawer
          isOpen={false}
          onClose={vi.fn()}
          listingId="listing_drawer_1"
          onOpenOverrideModal={vi.fn()}
          onOpenDeactivateModal={vi.fn()}
          onOpenHardDeleteModal={vi.fn()}
        />
      </Provider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('displays loading skeletons while fetching listing details', () => {
    vi.spyOn(adminListingApiModule, 'useGetAdminListingDetailQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminListingDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          listingId="listing_drawer_1"
          onOpenOverrideModal={vi.fn()}
          onOpenDeactivateModal={vi.fn()}
          onOpenHardDeleteModal={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByTestId('listing-detail-loading')).toBeInTheDocument();
  });

  it('renders listing specifications, landlord details, and reports when loaded', () => {
    vi.spyOn(adminListingApiModule, 'useGetAdminListingDetailQuery').mockReturnValue({
      data: { listing: mockPopulatedListing, reports: mockReports },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminListingDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          listingId="listing_drawer_1"
          onOpenOverrideModal={vi.fn()}
          onOpenDeactivateModal={vi.fn()}
          onOpenHardDeleteModal={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Luxury Bole Villa With Garden')).toBeInTheDocument();
    expect(screen.getByText('4 Beds')).toBeInTheDocument();
    expect(screen.getByText('3 Baths')).toBeInTheDocument();
    expect(screen.getByText('350 sqm')).toBeInTheDocument();
    expect(screen.getByText('Abebe Kebede')).toBeInTheDocument();
    expect(screen.getByText('+251911223344')).toBeInTheDocument();
    expect(screen.getByText('Moderation Reports (1)')).toBeInTheDocument();
    expect(screen.getByText('Price discrepancy')).toBeInTheDocument();
  });

  it('triggers quick actions: verify toggle and modal callbacks', async () => {
    vi.spyOn(adminListingApiModule, 'useGetAdminListingDetailQuery').mockReturnValue({
      data: { listing: mockPopulatedListing, reports: mockReports },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const onOpenOverrideModal = vi.fn();
    const onOpenDeactivateModal = vi.fn();
    const onOpenHardDeleteModal = vi.fn();

    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminListingDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          listingId="listing_drawer_1"
          onOpenOverrideModal={onOpenOverrideModal}
          onOpenDeactivateModal={onOpenDeactivateModal}
          onOpenHardDeleteModal={onOpenHardDeleteModal}
        />
      </Provider>
    );

    // Toggle verify
    fireEvent.click(screen.getByTestId('drawer-verify-btn'));
    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledWith({
        id: 'listing_drawer_1',
        isVerified: false,
      });
    });

    // Open override modal
    fireEvent.click(screen.getByTestId('drawer-override-btn'));
    expect(onOpenOverrideModal).toHaveBeenCalledWith(mockPopulatedListing);

    // Open takedown modal
    fireEvent.click(screen.getByTestId('drawer-takedown-btn'));
    expect(onOpenDeactivateModal).toHaveBeenCalledWith(mockPopulatedListing);

    // Open hard delete modal
    fireEvent.click(screen.getByTestId('drawer-hard-delete-btn'));
    expect(onOpenHardDeleteModal).toHaveBeenCalledWith(mockPopulatedListing);
  });
});
