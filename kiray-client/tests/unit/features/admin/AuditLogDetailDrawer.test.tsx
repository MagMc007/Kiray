import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AuditLogDetailDrawer } from '@/features/admin/auditLogs/components/AuditLogDetailDrawer';
import * as adminAuditApiModule from '@/features/admin/auditLogs/adminAuditApi';

describe('AuditLogDetailDrawer Component', () => {
  const mockLogId = 'audit_detail_1';

  const mockLogData = {
    _id: mockLogId,
    adminId: {
      _id: 'admin_1',
      displayName: 'Yonas Berhanu',
      email: 'yonas@kiray.et',
      role: 'admin',
    },
    action: 'listing.deactivate',
    targetType: 'Listing' as const,
    targetId: 'listing_987',
    metadata: {
      reason: 'Terms violation: unlicensed broker fees',
      previousStatus: 'open',
      newStatus: 'unavailable',
    },
    ipAddress: '196.188.240.10',
    createdAt: '2026-09-26T16:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminAuditApiModule, 'useGetAuditLogDetailQuery').mockReturnValue({
      data: mockLogData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders log details with admin information, target type and JSON metadata', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AuditLogDetailDrawer
          isOpen={true}
          onClose={vi.fn()}
          logId={mockLogId}
        />
      </Provider>
    );

    expect(screen.getByText('Audit Trail Record')).toBeInTheDocument();
    expect(screen.getAllByText('listing.deactivate').length).toBeGreaterThan(0);
    expect(screen.getByText('Yonas Berhanu')).toBeInTheDocument();
    expect(screen.getByText('yonas@kiray.et')).toBeInTheDocument();
    expect(screen.getByText('listing_987')).toBeInTheDocument();
    expect(screen.getByTestId('audit-metadata-json')).toHaveTextContent(
      'Terms violation: unlicensed broker fees'
    );
  });

  it('handles close button click', () => {
    const handleClose = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <AuditLogDetailDrawer
          isOpen={true}
          onClose={handleClose}
          logId={mockLogId}
        />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('close-audit-drawer-btn'));
    expect(handleClose).toHaveBeenCalled();
  });
});
