import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QuickSearchBar } from '@/features/listings/components/QuickSearchBar';
import { initialFilterState } from '@/features/listings/listingsSlice';

describe('QuickSearchBar Component', () => {
  it('renders keyword input, price inputs, and property type dropdown', () => {
    render(
      <QuickSearchBar
        filters={initialFilterState}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/search keywords/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min ETB')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max ETB')).toBeInTheDocument();
    expect(screen.getByText('All Property Types')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('triggers onApplyFilters when Search button is clicked', () => {
    const handleApply = vi.fn();
    render(
      <QuickSearchBar
        filters={initialFilterState}
        onApplyFilters={handleApply}
        onResetFilters={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search keywords/i);
    fireEvent.change(input, { target: { value: 'furnished villa' } });

    const minPriceInput = screen.getByPlaceholderText('Min ETB');
    fireEvent.change(minPriceInput, { target: { value: '10000' } });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'furnished villa',
        minPrice: 10000,
      })
    );
  });

  it('triggers onViewModeChange when clicking Split view button', () => {
    const handleViewChange = vi.fn();
    render(
      <QuickSearchBar
        filters={initialFilterState}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        viewMode="grid"
        onViewModeChange={handleViewChange}
      />
    );

    const splitBtn = screen.getByRole('button', { name: /map split/i });
    fireEvent.click(splitBtn);

    expect(handleViewChange).toHaveBeenCalledWith('split');
  });
});
