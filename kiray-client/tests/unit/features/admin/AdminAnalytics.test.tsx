import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AdminAnalytics } from '@/features/admin/dashboard/components/AdminAnalytics';
import type { Listing } from '@/types/listing';

vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal<typeof import('recharts')>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 400 }}>
        {children}
      </div>
    ),
  };
});

describe('AdminAnalytics Component (Step 2)', () => {
  const mockListings: Listing[] = [
    {
      _id: 'l1',
      title: 'Modern Bole Apartment',
      slug: 'modern-bole-apartment',
      description: 'Spacious apartment in Bole',
      price: 45000,
      propertyType: 'apartment',
      status: 'open',
      isVerified: true,
      isFlagged: false,
      address: {
        street: 'Cameroon St',
        city: 'Addis Ababa',
        neighborhood: 'Bole Medhanealem',
      },
      location: { type: 'Point', coordinates: [38.789, 8.995] },
      currency: 'ETB',
      bedrooms: 2,
      bathrooms: 2,
      area: 110,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking', 'security'],
      images: [],
      ownerId: 'u1',
      saveCount: 5,
      viewCount: 120,
      contactClickCount: 15,
      averageRating: 4.8,
      totalComments: 2,
      isDeleted: false,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    },
    {
      _id: 'l2',
      title: 'Luxury Villa CMC',
      slug: 'luxury-villa-cmc',
      description: 'Executive villa in CMC',
      price: 90000,
      propertyType: 'villa',
      status: 'open',
      isVerified: false,
      isFlagged: false,
      address: {
        street: 'CMC Main Rd',
        city: 'Addis Ababa',
        neighborhood: 'CMC',
      },
      location: { type: 'Point', coordinates: [38.835, 9.019] },
      currency: 'ETB',
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      areaUnit: 'sqm',
      amenities: ['security', 'parking', 'furnished'],
      images: [],
      ownerId: 'u2',
      saveCount: 8,
      viewCount: 230,
      contactClickCount: 20,
      averageRating: 5.0,
      totalComments: 4,
      isDeleted: false,
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
    },
  ];

  it('renders analytics shell and core charts', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminAnalytics listings={mockListings} />
      </Provider>
    );

    expect(screen.getByTestId('admin-analytics')).toBeInTheDocument();
    expect(screen.getByText('Platform Activity & Growth Trends')).toBeInTheDocument();
    expect(screen.getByText('Supply by Property Type')).toBeInTheDocument();
    expect(screen.getByText('Community Growth Velocity')).toBeInTheDocument();
  });

  it('does NOT render the neighborhood rent price bar chart (explicitly excluded as instructed)', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminAnalytics listings={mockListings} />
      </Provider>
    );

    expect(screen.queryByText(/Average Monthly Rent by Neighborhood/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Neighborhood Rents/i)).not.toBeInTheDocument();
  });

  it('renders focus filter navigation pills and toggles focus correctly', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminAnalytics listings={mockListings} />
      </Provider>
    );

    const activityPill = screen.getByRole('button', { name: /Platform Activity/i });
    const inventoryPill = screen.getByRole('button', { name: /Property Types/i });
    const growthPill = screen.getByRole('button', { name: /Community Growth/i });

    expect(activityPill).toBeInTheDocument();
    expect(inventoryPill).toBeInTheDocument();
    expect(growthPill).toBeInTheDocument();

    // Click inventory focus
    fireEvent.click(inventoryPill);
    expect(screen.getByText('Supply by Property Type')).toBeInTheDocument();
    expect(screen.queryByText('Platform Activity & Growth Trends')).not.toBeInTheDocument();

    // Click growth focus
    fireEvent.click(growthPill);
    expect(screen.getByText('Community Growth Velocity')).toBeInTheDocument();
    expect(screen.queryByText('Supply by Property Type')).not.toBeInTheDocument();
  });

  it('switches timeframe pills (7D, 30D, 90D, 1Y) on activity chart', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminAnalytics listings={mockListings} />
      </Provider>
    );

    const btn7D = screen.getByRole('button', { name: '7D' });
    const btn90D = screen.getByRole('button', { name: '90D' });
    const btn1Y = screen.getByRole('button', { name: '1Y' });

    expect(btn7D).toBeInTheDocument();
    fireEvent.click(btn7D);
    expect(btn7D).toHaveClass('text-orange-600');

    fireEvent.click(btn90D);
    expect(btn90D).toHaveClass('text-orange-600');

    fireEvent.click(btn1Y);
    expect(btn1Y).toHaveClass('text-orange-600');
  });

  it('renders property type distribution legend chips', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AdminAnalytics listings={mockListings} />
      </Provider>
    );

    expect(screen.getByText(/Apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Villa/i)).toBeInTheDocument();
  });

  it('renders property type distribution using backend propertyTypes aggregation', () => {
    const store = makeStore();
    const mockPropertyTypes = [
      { propertyType: 'apartment', count: 18, active: 15 },
      { propertyType: 'villa', count: 6, active: 5 },
      { propertyType: 'studio', count: 4, active: 4 },
    ];
    render(
      <Provider store={store}>
        <AdminAnalytics propertyTypes={mockPropertyTypes} />
      </Provider>
    );

    expect(screen.getByText('Apartment')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });
});
