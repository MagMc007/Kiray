import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoleSelect } from '@/features/auth/components/RoleSelect';

describe('RoleSelect component', () => {
  it('renders role options for Rentee and Owner', () => {
    render(<RoleSelect selectedRole="rentee" onSelectRole={() => {}} />);

    expect(screen.getByText('Register as Rentee')).toBeInTheDocument();
    expect(screen.getByText('Register as Owner')).toBeInTheDocument();
    expect(screen.getByText('Select Rentee')).toBeInTheDocument();
    expect(screen.getByText('Select Owner')).toBeInTheDocument();
  });

  it('triggers onSelectRole and onConfirm when a card is clicked', () => {
    const handleSelect = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <RoleSelect
        selectedRole="rentee"
        onSelectRole={handleSelect}
        onConfirm={handleConfirm}
      />
    );

    const ownerCard = screen.getByText('Register as Owner').closest('[role="button"]');
    expect(ownerCard).not.toBeNull();
    if (ownerCard) {
      fireEvent.click(ownerCard);
      expect(handleSelect).toHaveBeenCalledWith('landlord');
      expect(handleConfirm).toHaveBeenCalled();
    }
  });
});
