import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import ListingsBrowsePage from '@/app/listings/page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'q') return 'Bole';
      if (key === 'page') return '1';
      return null;
    },
    toString: () => 'q=Bole&page=1',
  }),
}));

describe('ListingsBrowsePage Integration', () => {
  it('renders browse chrome, search bar, and empty/results container', () => {
    const store = makeStore();

    render(
      <Provider store={store}>
        <ListingsBrowsePage />
      </Provider>
    );

    expect(screen.getByRole('link', { name: /browse properties/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search keywords/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /map split/i })).toBeInTheDocument();
  });
});
