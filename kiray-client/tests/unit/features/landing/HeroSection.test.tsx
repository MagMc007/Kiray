import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { CURATED_FEATURED_LISTINGS } from '@/features/landing/data/featuredListings';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HeroSection Component', () => {
  it('renders hero headline, subtitle, and dual CTA buttons', () => {
    render(<HeroSection />);

    expect(screen.getByText(/Your journey to a new home/i)).toBeInTheDocument();
    expect(screen.getByText(/made simple/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse Properties/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /List Your Property/i })).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    render(<HeroSection />);

    expect(screen.getByText('No Commissions')).toBeInTheDocument();
    expect(screen.getByText('Direct Contact')).toBeInTheDocument();
    expect(screen.getByText('Safe & Verified')).toBeInTheDocument();
  });

  it('triggers custom callbacks when buttons are clicked', () => {
    const handleBrowse = vi.fn();
    const handleList = vi.fn();

    render(
      <HeroSection
        onBrowse={handleBrowse}
        onListProperty={handleList}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Browse Properties/i }));
    expect(handleBrowse).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /List Your Property/i }));
    expect(handleList).toHaveBeenCalled();
  });

  it('renders passed featured listing details and handles favorite click', () => {
    const sample = CURATED_FEATURED_LISTINGS[0];
    const handleToggleFavorite = vi.fn();

    render(
      <HeroSection
        featuredListing={sample}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    expect(screen.getByText(sample.title)).toBeInTheDocument();
    expect(screen.getByText(/ETB 22,000/i)).toBeInTheDocument();

    const favBtn = screen.getByLabelText(/Save featured listing/i);
    fireEvent.click(favBtn);
    expect(handleToggleFavorite).toHaveBeenCalledWith(sample._id);
  });
});
