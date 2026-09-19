import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ListingForm } from '@/features/listings/components/ListingForm';
import type { Listing } from '@/types/listing';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard/landlord/listings/new',
}));

// Mock MapboxView so it doesn't try to load GL in node/jsdom
vi.mock('@/features/map/components/MapboxView', () => ({
  MapboxView: ({ onCoordinatesChange }: any) => (
    <div data-testid="mock-mapbox-view">
      <button
        type="button"
        data-testid="mock-map-click"
        onClick={() => onCoordinatesChange?.([38.80, 9.01])}
      >
        Click Map
      </button>
    </div>
  ),
}));

const renderWithStore = (ui: React.ReactElement) => {
  const store = makeStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('ListingForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn((file) => `blob:${file.name}`);
  });

  it('renders Step 1 basics inputs by default', () => {
    renderWithStore(<ListingForm mode="create" />);

    expect(screen.getByText('Publish New Rental Listing')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/)).toBeInTheDocument();
    expect(screen.getByText('Property Type *')).toBeInTheDocument();
    expect(screen.getByText('Floor Area & Unit')).toBeInTheDocument();
    expect(screen.getByText('Bedrooms *')).toBeInTheDocument();
    expect(screen.getByText('Bathrooms *')).toBeInTheDocument();
    expect(screen.getByText('Property Description *')).toBeInTheDocument();
  });

  it('navigates from Step 1 to Step 2 and interacts with Mapbox pin picker', () => {
    renderWithStore(<ListingForm mode="create" />);

    // Click Next Step
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    // Step 2 elements
    expect(screen.getByText(/Neighborhood \(Addis Ababa\) \*/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    expect(screen.getByTestId('mock-mapbox-view')).toBeInTheDocument();

    // Click map to change coordinates
    const mapClick = screen.getByTestId('mock-map-click');
    fireEvent.click(mapClick);
    expect(screen.getByText(/\[38.8000, 9.0100\]/)).toBeInTheDocument();
  });

  it('navigates to Step 3 and enforces minimum 2 images rule', () => {
    renderWithStore(<ListingForm mode="create" />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3 photos UI
    expect(screen.getByText(/Property Photos/)).toBeInTheDocument();
    expect(screen.getByText(/Minimum 2 required/i)).toBeInTheDocument();

    // Try to advance to Step 4 with 0 images
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Must show validation error and stay on Step 3
    expect(screen.getByText(/At least 2 property photos are required/i)).toBeInTheDocument();
    expect(screen.queryByText('Included Amenities & Services')).not.toBeInTheDocument();
  });

  it('accepts valid photo file uploads and allows proceeding once minimum 2 photos are added', () => {
    renderWithStore(<ListingForm mode="create" />);

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file1 = new File(['dummy content 1'], 'front-view.jpg', { type: 'image/jpeg' });
    const file2 = new File(['dummy content 2'], 'living-room.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file1, file2] } });

    // Expect cover photo badge and second photo
    expect(screen.getByText('Cover Photo')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('✓ Minimum met')).toBeInTheDocument();

    // Now clicking Next Step should successfully advance to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    expect(screen.getByText('Included Amenities & Services')).toBeInTheDocument();
    expect(screen.getByText('Monthly Rent (ETB) *')).toBeInTheDocument();
  });

  it('pre-populates existing listing and Cloudinary photos in edit mode', () => {
    const existingListing: Listing = {
      _id: 'edit_001',
      ownerId: 'owner_1',
      title: 'Luxury Villa in Old Airport',
      slug: 'luxury-villa-in-old-airport',
      description: 'Stunning villa with spacious compound.',
      price: 85000,
      currency: 'ETB',
      propertyType: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking', 'garden', 'pool'],
      location: { type: 'Point', coordinates: [38.74, 8.99] },
      address: { street: 'Old Airport Main Rd', city: 'Addis Ababa', neighborhood: 'Old Airport' },
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/villa1.jpg',
          publicId: 'villa1',
          order: 0,
        },
        {
          url: 'https://res.cloudinary.com/demo/image/upload/villa2.jpg',
          publicId: 'villa2',
          order: 1,
        },
      ],
      status: 'open',
      viewCount: 200,
      saveCount: 30,
      contactClickCount: 15,
      averageRating: 5.0,
      totalComments: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    renderWithStore(<ListingForm mode="edit" initialListing={existingListing} />);

    expect(screen.getByText('Edit Rental Listing')).toBeInTheDocument();
    const titleInput = screen.getByDisplayValue('Luxury Villa in Old Airport');
    expect(titleInput).toBeInTheDocument();

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Shows 2 existing Cloudinary photos
    expect(screen.getByText('Cover Photo')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();

    // Trying to delete when at exactly 2 images should be prevented
    const deleteButtons = screen.getAllByTitle('Remove photo');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/A listing must maintain at least 2 photos/)).toBeInTheDocument();
  });
});
