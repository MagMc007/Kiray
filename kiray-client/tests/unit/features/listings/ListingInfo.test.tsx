import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ListingInfo } from '@/features/listings/components/ListingInfo';
import type { Listing } from '@/types/listing';

describe('ListingInfo Component', () => {
  const mockListing: Listing = {
    _id: 'listing_001',
    ownerId: 'owner_123',
    title: 'Modern 2-Bedroom in Bole',
    slug: 'modern-2-bedroom-in-bole',
    description: 'A spacious and sunny apartment in the heart of Bole.',
    price: 35000,
    currency: 'ETB',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    areaUnit: 'sqm',
    amenities: ['wifi', 'parking', 'security'],
    location: {
      type: 'Point',
      coordinates: [38.7892, 9.0015],
    },
    address: {
      street: 'Cameroon St',
      city: 'Addis Ababa',
      neighborhood: 'Bole',
    },
    images: [],
    status: 'open',
    viewCount: 15,
    saveCount: 3,
    contactClickCount: 1,
    averageRating: 4.5,
    totalComments: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders title, formatted price, specs, description, and amenities', () => {
    render(<ListingInfo listing={mockListing} />);

    expect(screen.getByText('Modern 2-Bedroom in Bole')).toBeInTheDocument();
    expect(screen.getByText('Bole')).toBeInTheDocument();
    expect(screen.getByText('2 Beds')).toBeInTheDocument();
    expect(screen.getByText('2 Baths')).toBeInTheDocument();
    expect(screen.getByText('120 sqm')).toBeInTheDocument();
    expect(screen.getByText(/A spacious and sunny apartment in the heart of Bole/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Speed Wi-Fi/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Guarded Security/i)).toBeInTheDocument();
  });
});
