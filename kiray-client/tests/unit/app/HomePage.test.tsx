import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import HomePage from '@/app/page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('HomePage Integration', () => {
  it('renders Navbar, LandingPage, TrustRibbon, and Footer seamlessly', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Navbar
    expect(screen.getByRole('link', { name: /Browse Properties/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();

    // Landing Page sections
    expect(screen.getAllByText(/Your journey to a new home/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How Kiray Works' })).toBeInTheDocument();
    expect(screen.getByText(/Kiray vs. Traditional Street Brokers/i)).toBeInTheDocument();
    expect(screen.getByText('Featured Verified Listings')).toBeInTheDocument();
    expect(screen.getByText('Top Locations in Addis Ababa')).toBeInTheDocument();
    expect(screen.getByText('Loved by Renters and Property Owners')).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();

    // Trust Ribbon & Footer
    expect(screen.getByText('Rentals by Neighborhood')).toBeInTheDocument();
  });
});
