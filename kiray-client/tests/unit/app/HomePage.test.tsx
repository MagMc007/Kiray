import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';

describe('HomePage Showcase', () => {
  it('renders branding, trust ribbon, footer and interactive modal button', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Kiray/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Direct Homeowner Rentals/i)).toBeInTheDocument();
    expect(screen.getByText(/Map First Discovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Rentals by Neighborhood/i)).toBeInTheDocument();

    const previewModalBtn = screen.getByRole('button', { name: /Preview Modal/i });
    expect(previewModalBtn).toBeInTheDocument();

    fireEvent.click(previewModalBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Kiray Foundation Shell/i)).toBeInTheDocument();
  });
});
