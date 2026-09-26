import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AdminOverviewCards } from '@/features/admin/dashboard/components/AdminOverviewCards';
import type { AdminDashboardMetrics } from '@/types/admin';

describe('AdminOverviewCards Component (Step 3)', () => {
  const mockMetrics: AdminDashboardMetrics = {
    users: {
      total: 120,
      active: 110,
      suspended: 8,
      banned: 2,
      byRole: {
        landlord: 45,
        rentee: 73,
        admin: 2,
      },
    },
    listings: {
      total: 80,
      active: 74,
      flagged: 3,
    },
    reports: {
      pending: 5,
    },
  };

  it('renders skeleton loaders when isLoading is true', () => {
    render(<AdminOverviewCards isLoading={true} />);
    expect(screen.getByTestId('admin-overview-skeletons')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-overview-cards')).not.toBeInTheDocument();
  });

  it('renders live user metrics, breakdown and link to /admin/users', () => {
    render(<AdminOverviewCards metrics={mockMetrics} />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('110 active')).toBeInTheDocument();
    expect(screen.getByText(/45 Landlords · 73 Seekers/i)).toBeInTheDocument();
    expect(screen.getByText('10 restricted')).toBeInTheDocument();

    const manageUsersLink = screen.getByRole('link', { name: /Manage Users/i });
    expect(manageUsersLink).toHaveAttribute('href', '/admin/users');
  });

  it('renders listings metrics, active ratio and link to /admin/listings', () => {
    render(<AdminOverviewCards metrics={mockMetrics} />);

    expect(screen.getByText('74')).toBeInTheDocument();
    expect(screen.getByText(/\/ 80 total/i)).toBeInTheDocument();
    expect(screen.getByText('3 flagged for moderation')).toBeInTheDocument();

    const listingsLink = screen.getByRole('link', { name: /Moderate Listings/i });
    expect(listingsLink).toHaveAttribute('href', '/admin/listings');
  });

  it('renders pending reports with Action Required when pending > 0', () => {
    render(<AdminOverviewCards metrics={mockMetrics} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Action Required')).toBeInTheDocument();

    const flaggedLink = screen.getByRole('link', { name: /Review Queue/i });
    expect(flaggedLink).toHaveAttribute('href', '/admin/flagged');
  });

  it('renders All Clear when pending reports is 0', () => {
    const clearMetrics: AdminDashboardMetrics = {
      ...mockMetrics,
      reports: { pending: 0 },
    };
    render(<AdminOverviewCards metrics={clearMetrics} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('All Clear')).toBeInTheDocument();
    expect(screen.getByText('Moderation queue is all caught up')).toBeInTheDocument();
  });

  it('renders audit and governance links', () => {
    render(<AdminOverviewCards metrics={mockMetrics} />);

    const auditLink = screen.getByRole('link', { name: /Audit Trail/i });
    expect(auditLink).toHaveAttribute('href', '/admin/audit-logs');

    const systemLink = screen.getByRole('link', { name: /System Health/i });
    expect(systemLink).toHaveAttribute('href', '/admin/system');
  });
});
