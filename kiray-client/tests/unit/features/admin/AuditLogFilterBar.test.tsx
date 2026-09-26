import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuditLogFilterBar } from '@/features/admin/auditLogs/components/AuditLogFilterBar';

describe('AuditLogFilterBar Component', () => {
  it('renders filter controls and triggers onFilterChange when inputs change', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <AuditLogFilterBar
        filters={{ page: 1, limit: 20 }}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    );

    expect(screen.getByTestId('audit-filter-action')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-target-type')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-end-date')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-sort')).toBeInTheDocument();

    // Trigger action search
    fireEvent.change(screen.getByTestId('audit-filter-action'), {
      target: { value: 'resolve' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'resolve', page: 1 })
    );

    // Trigger targetType change
    fireEvent.change(screen.getByTestId('audit-filter-target-type'), {
      target: { value: 'Listing' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: 'Listing', page: 1 })
    );
  });

  it('renders reset button when active filters exist and triggers onReset', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <AuditLogFilterBar
        filters={{ page: 1, limit: 20, action: 'listing.deactivate' }}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByTestId('audit-filter-reset-btn');
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
