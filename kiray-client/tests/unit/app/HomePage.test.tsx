import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders branding and foundation status', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Kiray/i);
    expect(screen.getByText(/Foundation v0.1 initialized/i)).toBeInTheDocument();
    expect(screen.getByText(/Next.js 15/i)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS v4/i)).toBeInTheDocument();
  });
});
