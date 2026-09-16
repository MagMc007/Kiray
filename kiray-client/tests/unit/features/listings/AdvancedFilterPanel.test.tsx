import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AdvancedFilterPanel } from '@/features/listings/components/AdvancedFilterPanel';
import { initialFilterState } from '@/features/listings/listingsSlice';

describe('AdvancedFilterPanel Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <AdvancedFilterPanel
        isOpen={false}
        onClose={vi.fn()}
        filters={initialFilterState}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.queryByText(/filter properties/i)).not.toBeInTheDocument();
  });

  it('renders modal dialog when isOpen is true and submits applied filters', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <AdvancedFilterPanel
        isOpen={true}
        onClose={handleClose}
        filters={initialFilterState}
        onApplyFilters={handleApply}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getByText(/filter properties/i)).toBeInTheDocument();
    expect(screen.getByText(/bedrooms/i)).toBeInTheDocument();
    expect(screen.getByText(/bathrooms/i)).toBeInTheDocument();

    // Select 2 Beds
    const twoBedsBtn = screen.getByRole('button', { name: '2 Beds' });
    fireEvent.click(twoBedsBtn);

    // Click Apply Filters
    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: '2',
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
