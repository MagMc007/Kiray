import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import ListingDetailPage from '@/app/listings/[slug]/page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/sunny-apartment',
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('ListingDetailPage Integration', () => {
  it('renders listing detail shell and handles missing listing gracefully', async () => {
    const store = makeStore();
    const paramsPromise = Promise.resolve({ slug: 'non-existent-listing' });

    await React.act(async () => {
      render(
        <Provider store={store}>
          <ListingDetailPage params={paramsPromise} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/listing not found/i) || screen.getByText(/browse properties/i)
      ).toBeInTheDocument();
    });
  });
});
