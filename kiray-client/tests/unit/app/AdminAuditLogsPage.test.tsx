import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import AdminAuditLogsPage from '@/app/admin/audit-logs/page';
import { setCurrentUser } from '@/features/auth/authSlice';
import * as adminAuditApiModule from '@/features/admin/auditLogs/adminAuditApi';
import * as adminDashboardApiModule from '@/features/admin/dashboard/adminDashboardApi';
import type { User } from '@/types/user';
import type { AuditLog } from '@/types/auditLog';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/audit-logs',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('AdminAuditLogsPage Integration', () => {
  const mockAdmin: User = {
    _id: 'admin_1',
    email: 'admin@kiray.et',
    displayName: 'Lead Security Auditor',
    role: 'admin',
    status: 'active',
    firebaseUid: 'fb_admin_1',
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockLogs: AuditLog[] = [
    {
      _id: 'audit_log_1',
      adminId: {
        _id: 'admin_1',
        displayName: 'Lead Security Auditor',
        email: 'admin@kiray.et',
        role: 'admin',
      } as any,
      action: 'listing.flag.resolve',
      targetType: 'Listing',
      targetId: 'listing_123',
      metadata: { action: 'dismiss', notes: 'Verified owner identity' },
      ipAddress: '197.156.104.2',
      createdAt: '2026-09-26T17:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminDashboardApiModule, 'useGetDashboardQuery').mockReturnValue({
      data: {
        users: { total: 10, active: 8, suspended: 1, banned: 1, byRole: { landlord: 4, rentee: 5, admin: 1 } },
        listings: { total: 25, active: 20, flagged: 0 },
        reports: { pending: 0 },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminAuditApiModule, 'useListAuditLogsQuery').mockReturnValue({
      data: {
        logs: mockLogs,
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminAuditApiModule, 'useGetAuditLogDetailQuery').mockReturnValue({
      data: mockLogs[0],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders audit trail page with title, filter controls and log rows', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminAuditLogsPage />
      </Provider>
    );

    expect(screen.getByText('System Audit Trail')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-action')).toBeInTheDocument();
    expect(screen.getByTestId('audit-filter-target-type')).toBeInTheDocument();
    expect(screen.getByText('listing.flag.resolve')).toBeInTheDocument();
    expect(screen.getByText('Lead Security Auditor')).toBeInTheDocument();
  });

  it('opens audit detail drawer when Inspect button is clicked', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockAdmin));

    render(
      <Provider store={store}>
        <AdminAuditLogsPage />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('inspect-log-btn-audit_log_1'));
    expect(screen.getByTestId('audit-log-detail-drawer')).toBeInTheDocument();
    expect(screen.getByText('Audit Trail Record')).toBeInTheDocument();
    expect(screen.getByTestId('audit-metadata-json')).toHaveTextContent('Verified owner identity');
  });
});
