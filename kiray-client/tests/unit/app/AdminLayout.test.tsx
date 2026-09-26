import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AdminLayout, { metadata } from '@/app/admin/layout';

vi.mock('@/components/feedback/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-guard">{children}</div>
  ),
}));

describe('AdminLayout', () => {
  it('defines noindex and nofollow robots metadata for search engine exclusion', () => {
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
    expect(metadata.title).toBe('Admin Portal');
  });

  it('renders children wrapped in AuthGuard adminOnly shell', () => {
    render(
      <AdminLayout>
        <div data-testid="admin-child">Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('mock-auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByTestId('admin-child')).toHaveTextContent('Admin Content');
  });
});
