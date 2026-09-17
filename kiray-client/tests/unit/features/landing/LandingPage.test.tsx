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

    // 3. How Kiray Works
    expect(screen.getByText('How Kiray Works')).toBeInTheDocument();
    expect(screen.getByText('Discover on Map & Filters')).toBeInTheDocument();
    expect(screen.getByText('Connect Directly with Owner')).toBeInTheDocument();
    expect(screen.getByText('Tour, Sign & Move In')).toBeInTheDocument();

    // 4. Comparison Table
    expect(screen.getByText(/Kiray vs. Traditional Street Brokers/i)).toBeInTheDocument();
    expect(screen.getByText('0 ETB (100% Free)')).toBeInTheDocument();

    // 5. Featured Carousel
    expect(screen.getByText('Featured Verified Listings')).toBeInTheDocument();
    expect(screen.getByText('Auto-scrolling')).toBeInTheDocument();

    // 6. Neighborhood Guides
    expect(screen.getByText('Top Locations in Addis Ababa')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bole' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kazanchis' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CMC' })).toBeInTheDocument();

    // 7. Community Testimonials
    expect(screen.getByText('Loved by Renters and Property Owners')).toBeInTheDocument();
    expect(screen.getByText('Helen Desta')).toBeInTheDocument();
    expect(screen.getByText('Dawit Bekele')).toBeInTheDocument();

    // 8. FAQ Accordion
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();

    // 9. CTA Banner
    expect(screen.getByText('Ready to find your next home?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse Addis Properties/i })).toBeInTheDocument();
  });

  it('expands and collapses FAQ accordion items on click', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LandingPage />
      </Provider>
    );

    const firstFaqQuestion = screen.getByText(
      /What makes Kiray different from traditional street brokers/i
    );
    expect(firstFaqQuestion).toBeInTheDocument();

    // Initial state: first FAQ item is open by default
    expect(
      screen.getByText(/Traditional brokers charge home seekers 100%/i)
    ).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(firstFaqQuestion);
    expect(
      screen.queryByText(/Traditional brokers charge home seekers 100%/i)
    ).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(firstFaqQuestion);
    expect(
      screen.getByText(/Traditional brokers charge home seekers 100%/i)
    ).toBeInTheDocument();
  });

  it('routes to neighborhood search when a neighborhood card is clicked', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <LandingPage />
      </Provider>
    );

    const boleCard = screen.getByRole('heading', { name: 'Bole' });
    fireEvent.click(boleCard);

    expect(mockPush).toHaveBeenCalledWith('/listings?neighborhood=Bole');
  });
});
