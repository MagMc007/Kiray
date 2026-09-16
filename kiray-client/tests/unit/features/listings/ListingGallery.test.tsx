import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ListingGallery } from '@/features/listings/components/ListingGallery';

describe('ListingGallery Component', () => {
  const mockImages = [
    { url: 'https://images.unsplash.com/photo-1', publicId: 'img1', order: 0 },
    { url: 'https://images.unsplash.com/photo-2', publicId: 'img2', order: 1 },
  ];

  it('renders main image and thumbnail navigation', () => {
    render(
      <ListingGallery
        images={mockImages}
        title="Luxury Penthouse"
        isVerified={true}
        propertyType="apartment"
      />
    );

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
    expect(screen.getByText('apartment')).toBeInTheDocument();
  });

  it('navigates to next image when next button is clicked', () => {
    render(
      <ListingGallery
        images={mockImages}
        title="Luxury Penthouse"
      />
    );

    const nextBtn = screen.getByRole('button', { name: /next photo/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });
});
