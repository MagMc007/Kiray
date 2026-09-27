import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MyListingsTable } from '@/features/listings/components/MyListingsTable';
import type { Listing } from '@/types/listing';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard/landlord',
}));

const renderWithStore = (ui: React.ReactElement) => {
  const store = makeStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

const mockListings: Listing[] = [
  {
    _id: 'listing_01',
    ownerId: 'owner_1',
    title: 'Modern 2-Bedroom in Bole Atlas',
    slug: 'modern-2-bedroom-in-bole-atlas',
    description: 'Beautiful apartment',
    price: 32000,
    currency: 'ETB',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    areaUnit: 'sqm',
    amenities: ['wifi', 'parking'],
    location: { type: 'Point', coordinates: [38.78, 9.0] },
    address: { street: 'Atlas St', city: 'Addis Ababa', neighborhood: 'Bole' },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
        publicId: 'sample1',
        order: 0,
      },
    ],
    status: 'open',
    viewCount: 120,
    saveCount: 15,
    contactClickCount: 8,
    averageRating: 4.9,
    totalComments: 3,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'listing_02',
    ownerId: 'owner_1',
    title: 'Cozy Studio in Kazanchis',
    slug: 'cozy-studio-in-kazanchis',
    description: 'Compact space near ECA',
    price: 18000,
    currency: 'ETB',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    areaUnit: 'sqm',
    amenities: ['wifi'],
    location: { type: 'Point', coordinates: [38.76, 9.02] },
    address: { street: 'Menelik II Ave', city: 'Addis Ababa', neighborhood: 'Kazanchis' },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
        publicId: 'sample2',
        order: 0,
      },
    ],
    status: 'rented',
    viewCount: 85,
    saveCount: 6,
    contactClickCount: 4,
    averageRating: 4.5,
    totalComments: 1,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'listing_03',
    ownerId: 'owner_1',
    title: 'Archived Townhouse in CMC',
    slug: 'archived-townhouse-in-cmc',
    description: 'Quiet suburb',
    price: 45000,
    currency: 'ETB',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 3,
    area: 200,
    areaUnit: 'sqm',
    amenities: ['parking', 'security'],
    location: { type: 'Point', coordinates: [38.85, 9.02] },
    address: { street: 'CMC St', city: 'Addis Ababa', neighborhood: 'CMC' },
    images: [],
    status: 'unavailable',
    viewCount: 10,
    saveCount: 0,
    contactClickCount: 0,
    averageRating: 0,
    totalComments: 0,
    isDeleted: true,
    deletedAt: '2026-01-10T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
];

describe('MyListingsTable Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders listing cards with title, price, and analytics metrics', () => {
    renderWithStore(<MyListingsTable listings={mockListings} />);

    expect(screen.getByText('Modern 2-Bedroom in Bole Atlas')).toBeInTheDocument();
    expect(screen.getByText('Cozy Studio in Kazanchis')).toBeInTheDocument();
    expect(screen.getByText(/120 views/)).toBeInTheDocument();
    expect(screen.getByText(/15 saves/)).toBeInTheDocument();
    expect(screen.getByText(/8 contacts/)).toBeInTheDocument();
  });

  it('filters listings by status pill', () => {
    renderWithStore(<MyListingsTable listings={mockListings} />);

    // Click "Rented" pill
    const rentedPill = screen.getByRole('button', { name: 'Rented' });
    fireEvent.click(rentedPill);

    expect(screen.getByText('Cozy Studio in Kazanchis')).toBeInTheDocument();
    expect(screen.queryByText('Modern 2-Bedroom in Bole Atlas')).not.toBeInTheDocument();

    // Click "Archived" pill
    const archivedPill = screen.getByRole('button', { name: 'Archived' });
    fireEvent.click(archivedPill);

    expect(screen.getByText('Archived Townhouse in CMC')).toBeInTheDocument();
    expect(screen.queryByText('Cozy Studio in Kazanchis')).not.toBeInTheDocument();
  });

  it('shows empty state when no listings match filter', () => {
    renderWithStore(<MyListingsTable listings={[]} />);

    expect(screen.getByText('No properties match this filter')).toBeInTheDocument();
    expect(screen.getByText('Publish New Listing')).toBeInTheDocument();
  });

  it('renders status select dropdown for active listings', () => {
    renderWithStore(<MyListingsTable listings={mockListings} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    expect(selects[0]).toHaveValue('open');
    expect(selects[1]).toHaveValue('rented');
  });

  it('renders archive button for active listings and restore button for archived listings', () => {
    renderWithStore(<MyListingsTable listings={mockListings} />);

    // In default 'all' view, listing_01 and listing_02 show Archive buttons
    const archiveButtons = screen.getAllByTitle('Archive listing');
    expect(archiveButtons.length).toBe(2);

    // Switch to archived view
    const archivedPill = screen.getByRole('button', { name: 'Archived' });
    fireEvent.click(archivedPill);

    const restoreButton = screen.getByTitle('Restore listing to active');
    expect(restoreButton).toBeInTheDocument();
  });

  it('disables publish button in empty state when listing limit is reached', () => {
    renderWithStore(<MyListingsTable listings={[]} isLimitReached={true} maxLimit={10} />);

    expect(screen.getByText('No properties match this filter')).toBeInTheDocument();
    expect(screen.getByText(/Listing Limit Reached \(10\/10\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Publish New Listing/i })).not.toBeInTheDocument();
  });
});
