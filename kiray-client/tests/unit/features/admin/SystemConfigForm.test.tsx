import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemConfigForm } from '@/features/admin/system/components/SystemConfigForm';
import * as adminSystemApi from '@/features/admin/system/adminSystemApi';

describe('SystemConfigForm Component', () => {
  const mockUpdateConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when initial config is loading', () => {
    vi.spyOn(adminSystemApi, 'useGetConfigQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(adminSystemApi, 'useUpdateConfigMutation').mockReturnValue([
      mockUpdateConfig,
      { isLoading: false },
    ] as any);

    render(<SystemConfigForm />);
    expect(screen.getByTestId('system-config-loading')).toBeInTheDocument();
  });

  it('renders error alert when config fails to load', () => {
    vi.spyOn(adminSystemApi, 'useGetConfigQuery').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { data: { message: 'Config fetch unauthorized' } },
    } as any);

    vi.spyOn(adminSystemApi, 'useUpdateConfigMutation').mockReturnValue([
      mockUpdateConfig,
      { isLoading: false },
    ] as any);

    render(<SystemConfigForm />);
    expect(screen.getByTestId('system-config-error')).toBeInTheDocument();
    expect(screen.getByText('Config fetch unauthorized')).toBeInTheDocument();
  });

  it('renders config inputs, toggles values, and submits mutation', async () => {
    vi.spyOn(adminSystemApi, 'useGetConfigQuery').mockReturnValue({
      data: {
        maintenanceMode: false,
        allowNewSignups: true,
        maxListingsPerLandlord: 25,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUpdateConfig.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        maintenanceMode: true,
        allowNewSignups: false,
        maxListingsPerLandlord: 30,
      }),
    });

    vi.spyOn(adminSystemApi, 'useUpdateConfigMutation').mockReturnValue([
      mockUpdateConfig,
      { isLoading: false },
    ] as any);

    render(<SystemConfigForm />);

    const maintenanceToggle = screen.getByTestId('maintenance-mode-toggle');
    const signupsToggle = screen.getByTestId('allow-signups-toggle');
    const maxListingsInput = screen.getByTestId('max-listings-input');
    const submitBtn = screen.getByTestId('save-config-btn');

    expect(maintenanceToggle).not.toBeChecked();
    expect(signupsToggle).toBeChecked();
    expect(maxListingsInput).toHaveValue(25);
    expect(submitBtn).toBeDisabled(); // not dirty yet

    // Toggle maintenance mode
    fireEvent.click(maintenanceToggle);
    expect(maintenanceToggle).toBeChecked();
    expect(submitBtn).not.toBeDisabled();

    // Toggle signups
    fireEvent.click(signupsToggle);
    expect(signupsToggle).not.toBeChecked();

    // Change max listings
    fireEvent.change(maxListingsInput, { target: { value: '30' } });
    expect(maxListingsInput).toHaveValue(30);

    // Submit form
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        maintenanceMode: true,
        allowNewSignups: false,
        maxListingsPerLandlord: 30,
      });
    });

    expect(
      await screen.findByText('Platform configuration updated successfully.')
    ).toBeInTheDocument();
  });
});
