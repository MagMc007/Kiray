import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PurgeSoftDeletedModal } from '@/features/admin/system/components/PurgeSoftDeletedModal';
import * as adminSystemApi from '@/features/admin/system/adminSystemApi';

describe('PurgeSoftDeletedModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockPurgeSoftDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    vi.spyOn(adminSystemApi, 'usePurgeSoftDeletedMutation').mockReturnValue([
      mockPurgeSoftDeleted,
      { isLoading: false },
    ] as any);

    render(
      <PurgeSoftDeletedModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByTestId('purge-modal-form')).not.toBeInTheDocument();
  });

  it('renders modal, enforces typed PURGE confirmation strictly, and executes purge', async () => {
    mockPurgeSoftDeleted.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        purgedListingsCount: 12,
        purgedUsersCount: 3,
        cutoffDate: '2026-08-27T00:00:00.000Z',
      }),
    });

    vi.spyOn(adminSystemApi, 'usePurgeSoftDeletedMutation').mockReturnValue([
      mockPurgeSoftDeleted,
      { isLoading: false },
    ] as any);

    render(
      <PurgeSoftDeletedModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Permanent Database Purge')).toBeInTheDocument();
    expect(screen.getByText(/Irreversible Action/)).toBeInTheDocument();

    const purgeBtn = screen.getByTestId('execute-purge-btn');
    const confirmInput = screen.getByTestId('purge-confirm-input');
    const daysSelect = screen.getByTestId('days-old-select');
    const listingsTargetBtn = screen.getByTestId('target-btn-listings');

    // Button should initially be disabled
    expect(purgeBtn).toBeDisabled();

    // Type incorrect casing or wrong text -> still disabled
    fireEvent.change(confirmInput, { target: { value: 'purge' } });
    expect(purgeBtn).toBeDisabled();

    fireEvent.change(confirmInput, { target: { value: 'DELETE' } });
    expect(purgeBtn).toBeDisabled();

    // Change target to listings and daysOld to 60
    fireEvent.click(listingsTargetBtn);
    fireEvent.change(daysSelect, { target: { value: '60' } });

    // Type exact required text: 'PURGE'
    fireEvent.change(confirmInput, { target: { value: 'PURGE' } });
    expect(purgeBtn).not.toBeDisabled();

    // Click submit
    fireEvent.click(purgeBtn);

    await waitFor(() => {
      expect(mockPurgeSoftDeleted).toHaveBeenCalledWith({
        target: 'listings',
        daysOld: 60,
      });
      expect(mockOnSuccess).toHaveBeenCalledWith({
        purgedListingsCount: 12,
        purgedUsersCount: 3,
        cutoffDate: '2026-08-27T00:00:00.000Z',
      });
    });

    // Verify success view rendered
    expect(await screen.findByTestId('purge-success-view')).toBeInTheDocument();
    expect(screen.getByText('Purge Completed')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByTestId('purge-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
