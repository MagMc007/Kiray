import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuditLogTable } from '@/features/admin/auditLogs/components/AuditLogTable';
import type { AuditLog } from '@/types/auditLog';

describe('AuditLogTable Component', () => {
  const mockLogs: AuditLog[] = [
    {
      _id: 'audit_row_1',
      adminId: {
        _id: 'admin_1',
        displayName: 'Mahlet Alemu',
        email: 'mahlet@kiray.et',
        role: 'admin',
      } as any,
      action: 'listing.flag.resolve',
      targetType: 'Listing',
      targetId: 'listing_123',
      metadata: { actionTaken: 'dismiss', notes: 'False alarm verified' },
      ipAddress: '197.156.104.2',
      createdAt: '2026-09-26T15:00:00.000Z',
    },
  ];

  it('renders log records with admin name, action badge and triggers onSelectLog', () => {
    const handleSelect = vi.fn();

    render(
      <AuditLogTable
        logs={mockLogs}
        onSelectLog={handleSelect}
      />
    );

    expect(screen.getByText('Mahlet Alemu')).toBeInTheDocument();
    expect(screen.getByText('listing.flag.resolve')).toBeInTheDocument();
    expect(screen.getByText('Listing')).toBeInTheDocument();
    expect(screen.getByText('197.156.104.2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('inspect-log-btn-audit_row_1'));
    expect(handleSelect).toHaveBeenCalledWith(mockLogs[0]);
  });

  it('renders empty state when log array is empty', () => {
    render(
      <AuditLogTable
        logs={[]}
        onSelectLog={vi.fn()}
      />
    );

    expect(screen.getByTestId('audit-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Audit Records Found')).toBeInTheDocument();
  });
});
