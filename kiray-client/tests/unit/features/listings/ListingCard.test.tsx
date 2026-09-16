import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ListingCard } from '@/features/listings/components/ListingCard';
import type { Listing } from '@/types/listing';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const sampleListing: Listing = {
  _id: 'list_test_1',
  ownerId: {
    _id: 'owner_test_1',
    firebaseUid: 'fb_1',
    role: 'landlord',
    status: 'active',
    displayName: 'Alemayehu T.',
    email: 'alemayehu@example.com',
    phone: '+251911223344',
    whatsapp: '+251911223344',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    profileCompleted: true,
    isVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  title: 'Sunny 2-Bedroom in Bole Atlas',
  slug: 'sunny-2-bedroom-in-bole-atlas',
  description: 'Spacious apartment near restaurants and cafes.',
  price: 28000,
  currency: 'ETB',
  propertyType: 'apartment',
  bedrooms: 2,
  bathrooms: 2,
  area: 105,
  areaUnit: 'sqm',
  amenities: ['wifi', 'parking', 'backup_generator'],
  location: {
    type: 'Point',
    coordinates: [38.7892, 9.0015],
  },
  address: {
    street: 'Atlas Hotel Road',
    city: 'Addis Ababa',
    neighborhood: 'Bole Atlas',
  },
  images: [
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      publicId: 'img_1',
      order: 0,
    },
    {
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      publicId: 'img_2',
      order: 1,
    },
  ],
  status: 'open',
  isVerified: true,
  viewCount: 120,
  saveCount: 15,
  contactClickCount: 8,
  averageRating: 4.9,
  totalComments: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ListingCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders property title, formatted price, specs and location', () => {
    render(<ListingCard listing={sampleListing} />);

    expect(screen.getByText('Sunny 2-Bedroom in Bole Atlas')).toBeInTheDocument();
    expect(screen.getByText(/ETB 28,000/i)).toBeInTheDocument();
    expect(screen.getByText('2 Beds')).toBeInTheDocument();
    expect(screen.getByText('2 Baths')).toBeInTheDocument();
    expect(screen.getByText('105 m²')).toBeInTheDocument();
    expect(screen.getByText('Bole Atlas')).toBeInTheDocument();
    expect(screen.getByText('Atlas Hotel Road')).toBeInTheDocument();
    expect(screen.getByText('Verified Owner')).toBeInTheDocument();
    expect(screen.getByText('Alemayehu T.')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('handles favorite button click', () => {
    const handleToggleFavorite = vi.fn();
    render(
      <ListingCard
        listing={sampleListing}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    const favBtn = screen.getByRole('button', { name: /Save listing/i });
    fireEvent.click(favBtn);
    expect(handleToggleFavorite).toHaveBeenCalledWith('list_test_1');
  });

  it('handles card navigation click', () => {
    const handleSelectListing = vi.fn();
    render(
      <ListingCard
        listing={sampleListing}
        onSelectListing={handleSelectListing}
      />
    );

    const detailsBtn = screen.getByRole('button', { name: /Details/i });
    fireEvent.click(detailsBtn);
    expect(handleSelectListing).toHaveBeenCalledWith(sampleListing);
  });

  it('handles direct contact actions', () => {
    const handleContact = vi.fn();
    render(
      <ListingCard
        listing={sampleListing}
        onContactClick={handleContact}
      />
    );

    const waBtn = screen.getByRole('button', { name: /Message owner on WhatsApp/i });
    fireEvent.click(waBtn);
    expect(handleContact).toHaveBeenCalledWith(sampleListing, 'whatsapp');

    const callBtn = screen.getByRole('button', { name: /Call landlord directly/i });
    fireEvent.click(callBtn);
    expect(handleContact).toHaveBeenCalledWith(sampleListing, 'call');
  });

  it('cycles through images on next/previous button clicks', () => {
    render(<ListingCard listing={sampleListing} />);

    const nextBtn = screen.getByRole('button', { name: /Next photo/i });
    const prevBtn = screen.getByRole('button', { name: /Previous photo/i });

    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    const img = screen.getByAltText('Sunny 2-Bedroom in Bole Atlas');
    expect(img).toHaveAttribute('src', sampleListing.images[1].url);

    fireEvent.click(prevBtn);
    expect(img).toHaveAttribute('src', sampleListing.images[0].url);
  });
});
