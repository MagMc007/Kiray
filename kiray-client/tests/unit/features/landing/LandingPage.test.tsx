import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { LandingPage } from '@/features/landing/components/LandingPage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all core landing page sections', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LandingPage />
      </Provider>
    );

    // 1. Hero
    expect(screen.getAllByText(/Your journey to a new home/i)[0]).toBeInTheDocument();

    // 2. Value Props
    expect(screen.getByText('Map First Discovery')).toBeInTheDocument();
    expect(screen.getByText('Verified Owners')).toBeInTheDocument();

    // 3. How Kiray Works (Audience Switcher + Flashcards)
    expect(screen.getByText('How Kiray Works')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^for renters$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^for property owners$/i })).toBeInTheDocument();

    // Renters cards (default)
    expect(screen.getByText('Discover on Map & Filters')).toBeInTheDocument();
    expect(screen.getByText('Connect Directly with Owner')).toBeInTheDocument();
    expect(screen.getByText('Tour, Sign & Move In')).toBeInTheDocument();

    // Switch to Property Owners tab
    const ownersTabBtn = screen.getByRole('button', { name: /^for property owners$/i });
    fireEvent.click(ownersTabBtn);

    expect(screen.getByText('Manage from Dashboard')).toBeInTheDocument();
    expect(screen.getByText('100% Commission-Free')).toBeInTheDocument();
    expect(screen.getByText('Direct WhatsApp & Phone Calls')).toBeInTheDocument();

    // Switch back to Renters tab
    const rentersTabBtn = screen.getByRole('button', { name: /^for renters$/i });
    fireEvent.click(rentersTabBtn);
    expect(screen.getByText('Discover on Map & Filters')).toBeInTheDocument();

    // 4. Comparison Table
    expect(screen.getByText(/Kiray vs. Brokers/i)).toBeInTheDocument();
    expect(screen.getByText('0 ETB (100% Free)')).toBeInTheDocument();

    // 5. Featured Carousel
    expect(screen.getByText('Featured Verified Listings')).toBeInTheDocument();

    // 6. Discover on the Map
    expect(screen.getByText('Discover on the Map')).toBeInTheDocument();
    expect(screen.getByText('Top Locations in Addis Ababa')).toBeInTheDocument();

    // 7. Community Testimonials
    expect(screen.getByText('Loved by Renters and Property Owners')).toBeInTheDocument();
    expect(screen.getByText('Helen Desta')).toBeInTheDocument();
    expect(screen.getByText('Dawit Bekele')).toBeInTheDocument();

    // 8. FAQ Accordion
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();

    // 9. CTA Banner
    expect(screen.getByText('Ready to find your next home?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse Addis Properties/i })).toBeInTheDocument();
  }, 15000);

  it('expands and collapses FAQ accordion items on click', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LandingPage />
      </Provider>
    );

    const firstFaqQuestion = screen.getByText(
      /What makes Kiray different from Brokers/i
    );
    expect(firstFaqQuestion).toBeInTheDocument();

    // Initial state: first FAQ item is open by default
    expect(
      screen.getByText(/Brokers charge home seekers 100%/i)
    ).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(firstFaqQuestion);
    expect(
      screen.queryByText(/Brokers charge home seekers 100%/i)
    ).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(firstFaqQuestion);
    expect(
      screen.getByText(/Brokers charge home seekers 100%/i)
    ).toBeInTheDocument();
  });

  it('routes to browse listings when "Browse Addis Properties" is clicked', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LandingPage />
      </Provider>
    );

    const browseBtn = screen.getByRole('button', { name: /Browse Addis Properties/i });
    fireEvent.click(browseBtn);

    expect(mockPush).toHaveBeenCalledWith('/listings');
  });
});
