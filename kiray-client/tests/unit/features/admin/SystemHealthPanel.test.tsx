import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemHealthPanel } from '@/features/admin/system/components/SystemHealthPanel';
import * as adminSystemApi from '@/features/admin/system/adminSystemApi';

describe('SystemHealthPanel Component', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton state when health query is loading', () => {
    vi.spyOn(adminSystemApi, 'useGetHealthQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    } as any);

    render(<SystemHealthPanel />);
    expect(screen.getByTestId('system-health-loading')).toBeInTheDocument();
  });

  it('renders error state and handles retry button', () => {
    vi.spyOn(adminSystemApi, 'useGetHealthQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { data: { message: 'Database connection failed' } },
      refetch: mockRefetch,
      isFetching: false,
    } as any);

    render(<SystemHealthPanel />);
    expect(screen.getByTestId('system-health-error')).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();

    const retryBtn = screen.getByText('Retry Connection');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders system health metrics, uptime, and database details when loaded', () => {
    vi.spyOn(adminSystemApi, 'useGetHealthQuery').mockReturnValue({
      data: {
        status: 'healthy',
        uptime: 90065, // 1d 1h 1m 5s
        timestamp: '2026-09-26T22:00:00.000Z',
        database: {
          status: 'connected',
          host: 'mongodb://cluster-0.kiray.net',
          name: 'kiray-production',
        },
        memory: {
          rss: 104857600, // 100 MB
          heapTotal: 52428800, // 50 MB
          heapUsed: 26214400, // 25 MB (50%)
          external: 1048576,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    } as any);

    render(<SystemHealthPanel />);

    expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();
    expect(screen.getByTestId('health-status-badge')).toHaveTextContent('healthy');
    expect(screen.getByText('Database: kiray-production')).toBeInTheDocument();
    expect(screen.getByText(/cluster-0\.kiray\.net/)).toBeInTheDocument();

    // Check uptime formatting: 90065s -> 1d 1h 1m 5s
    expect(screen.getByTestId('uptime-display')).toHaveTextContent('1d 1h 1m 5s');

    // Check memory calculation: 50% Heap
    expect(screen.getByText('50% Heap')).toBeInTheDocument();
    expect(screen.getByText('Used: 25.0 MB')).toBeInTheDocument();
    expect(screen.getByText('RSS: 100.0 MB')).toBeInTheDocument();

    // Click refresh button
    const refreshBtn = screen.getByTestId('health-refresh-btn');
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
