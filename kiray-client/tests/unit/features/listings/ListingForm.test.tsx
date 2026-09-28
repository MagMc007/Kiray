import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ListingForm } from '@/features/listings/components/ListingForm';
import type { Listing } from '@/types/listing';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import * as listingsApiModule from '@/features/listings/listingsApi';

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
    expect(screen.getByText(/Floor Area & Unit/)).toBeInTheDocument();
    expect(screen.getByText('Bedrooms *')).toBeInTheDocument();
    expect(screen.getByText('Bathrooms *')).toBeInTheDocument();
    expect(screen.getByText('Property Description *')).toBeInTheDocument();
  });

  it('prevents advancing from Step 1 when required fields are missing', async () => {
    renderWithStore(<ListingForm mode="create" />);

    // Click Next Step without filling required title or description
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    // Should display validation errors and remain on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Description must be at least 10 characters/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Neighborhood \(Addis Ababa\)/)).not.toBeInTheDocument();
  });

  it('navigates from Step 1 to Step 2 and interacts with Mapbox pin picker', async () => {
    renderWithStore(<ListingForm mode="create" />);

    // Fill required Step 1 fields
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Cozy Modern Flat in Bole' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Convenient apartment located in central Bole close to all services.' },
    });

    // Click Next Step
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    // Step 2 elements
    await waitFor(() => {
      expect(screen.getByText(/Neighborhood \(Addis Ababa\) \*/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\. Bole, Kazanchis/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
      expect(screen.getByTestId('mock-mapbox-view')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use my current location/i })).toBeInTheDocument();
    });

    // Click map to change coordinates
    const mapClick = screen.getByTestId('mock-map-click');
    fireEvent.click(mapClick);
    expect(screen.getByText(/\[38.8000, 9.0100\]/)).toBeInTheDocument();
  });

  it('detects device location and updates coordinates when clicking Use My Current Location', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) =>
        success({
          coords: {
            latitude: 9.025,
            longitude: 38.745,
          },
        })
      ),
    };
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: mockGeolocation,
    });

    renderWithStore(<ListingForm mode="create" />);

    // Advance to Step 2
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Cozy Modern Flat in Bole' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Convenient apartment located in central Bole close to all services.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /use my current location/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /use my current location/i }));

    await waitFor(() => {
      expect(screen.getByText(/\[38.7450, 9.0250\]/)).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it('prevents advancing from Step 2 when required address fields are missing', async () => {
    renderWithStore(<ListingForm mode="create" />);

    // Fill Step 1
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Cozy Modern Flat in Bole' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Convenient apartment located in central Bole close to all services.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // On Step 2, street & neighborhood are empty by default. Try to advance.
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText(/Street is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Neighborhood is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Property Photos/)).not.toBeInTheDocument();
  });

  it('navigates to Step 3 and enforces minimum 2 images rule', async () => {
    renderWithStore(<ListingForm mode="create" />);

    // Advance to Step 2
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Cozy Modern Flat in Bole' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Convenient apartment located in central Bole close to all services.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Advance to Step 3
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/Near Edna Mall/), {
      target: { value: 'Cameroon Street' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bole, Kazanchis/i), {
      target: { value: 'Bole' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3 photos UI
    await waitFor(() => {
      expect(screen.getByText(/Property Photos/)).toBeInTheDocument();
      expect(screen.getByText(/Minimum 2 required/i)).toBeInTheDocument();
    });

    // Try to advance to Step 4 with 0 images
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Must show validation error and stay on Step 3
    await waitFor(() => {
      expect(screen.getByText(/At least 2 property photos are required/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Monthly Rent (ETB) *')).not.toBeInTheDocument();
  });

  it('accepts valid photo file uploads and allows proceeding once minimum 2 photos are added', async () => {
    renderWithStore(<ListingForm mode="create" />);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Cozy Modern Flat in Bole' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Convenient apartment located in central Bole close to all services.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 2
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/Near Edna Mall/), {
      target: { value: 'Cameroon Street' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bole, Kazanchis/i), {
      target: { value: 'Bole' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Advance to Step 3
    await waitFor(() => {
      expect(screen.getByText(/Property Photos/)).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByText(/Included Amenities & Services/)).toBeInTheDocument();
      expect(screen.getByText('Monthly Rent (ETB) *')).toBeInTheDocument();
    });
  });

  it('pre-populates existing listing and Cloudinary photos in edit mode', async () => {
    const existingListing: Listing = {
      _id: 'edit_001',
      ownerId: 'owner_1',
      title: 'Luxury Villa in Old Airport',
      slug: 'luxury-villa-in-old-airport',
      description: 'Stunning villa with spacious compound and amenities.',
      price: 85000,
      currency: 'ETB',
      propertyType: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking', 'garden', 'pool'],
      location: { type: 'Point', coordinates: [38.74, 8.99] },
      address: {
        street: 'Old Airport Main Rd',
        city: 'Addis Ababa',
        neighborhood: 'Old Airport',
        postalCode: '1000',
      },
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

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    // Advance to Step 3
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Shows 2 existing Cloudinary photos
    await waitFor(() => {
      expect(screen.getByText('Cover Photo')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    // Trying to delete when at exactly 2 images should be prevented
    const deleteButtons = screen.getAllByTitle('Remove photo');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/A listing must maintain at least 2 photos/)).toBeInTheDocument();
  });

  it('submits the form when all required fields across all steps are filled', async () => {
    let resolveCreate: (val: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });

    const mockCreatedListing: Listing = {
      _id: 'new_listing_123',
      ownerId: 'owner_1',
      title: 'Luxury 3-Bedroom Penthouse',
      slug: 'luxury-3-bedroom-penthouse',
      description: 'Spacious penthouse with panoramic city views, private security, and amenities.',
      price: 20000,
      currency: 'ETB',
      propertyType: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      area: 80,
      areaUnit: 'sqm',
      amenities: ['wifi', 'security', 'water_included'],
      location: { type: 'Point', coordinates: [38.74, 9.01] },
      address: {
        street: 'Bole Medhanialem Road',
        city: 'Addis Ababa',
        neighborhood: 'Bole',
        postalCode: '1000',
      },
      images: [],
      status: 'open',
      viewCount: 0,
      saveCount: 0,
      contactClickCount: 0,
      averageRating: 0,
      totalComments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockCreateListing = vi.fn().mockReturnValue({
      unwrap: () => createPromise,
    });
    const mockUploadListingImages = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve([]),
    });

    vi.spyOn(listingsApiModule, 'useCreateListingMutation').mockReturnValue([
      mockCreateListing,
      { isLoading: false } as any,
    ]);
    vi.spyOn(listingsApiModule, 'useUploadListingImagesMutation').mockReturnValue([
      mockUploadListingImages,
      { isLoading: false } as any,
    ]);

    const onSubmitSuccess = vi.fn();
    renderWithStore(<ListingForm mode="create" onSubmitSuccess={onSubmitSuccess} />);

    // Step 1: title, description
    fireEvent.change(screen.getByPlaceholderText(/Modern 2-Bedroom Sunlit Flat/), {
      target: { value: 'Luxury 3-Bedroom Penthouse' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe features:/), {
      target: { value: 'Spacious penthouse with panoramic city views, private security, and amenities.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 2: street
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Near Edna Mall/)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/Near Edna Mall/), {
      target: { value: 'Bole Medhanialem Road' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Bole, Kazanchis/i), {
      target: { value: 'Bole' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3: photos
    await waitFor(() => {
      expect(screen.getByText(/Property Photos/)).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['pic 1'], 'room1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['pic 2'], 'room2.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file1, file2] } });
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 4: price and amenities
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Rental Listing/i })).toBeInTheDocument();
    });

    const publishBtn = screen.getByRole('button', { name: /Publish Rental Listing/i });
    fireEvent.click(publishBtn);

    // Verify submit button is disabled or in submitting state
    await waitFor(() => {
      expect(publishBtn).toBeDisabled();
    });

    // Resolve the creation mutation
    resolveCreate!(mockCreatedListing);

    // Verify submission succeeds and navigates
    await waitFor(() => {
      expect(onSubmitSuccess).toHaveBeenCalledWith(mockCreatedListing);
      expect(mockPush).toHaveBeenCalledWith('/dashboard/landlord');
    });
  });
});
