import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';

describe('UI Primitives (Step 6)', () => {
  describe('Button', () => {
    it('renders with label and handles click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Submit</Button>);
      const button = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading spinner and disables button when isLoading is true', () => {
      render(<Button isLoading>Loading Action</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies variant styling', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-orange-600');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-rose-600');
    });
  });

  describe('Input', () => {
    it('renders input with label and helper text', () => {
      render(<Input label="Email Address" helperText="We will never share your email." />);
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByText(/We will never share your email/i)).toBeInTheDocument();
    });

    it('renders error message when error prop is provided', () => {
      render(<Input label="Password" error="Password must be at least 8 characters" />);
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('renders badge text and dot indicator', () => {
      render(
        <Badge variant="success" dot>
          Verified
        </Badge>,
      );
      expect(screen.getByText(/Verified/i)).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('renders dialog content when open and triggers onClose', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal Body Content</p>
        </Modal>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Test Modal/i)).toBeInTheDocument();
      expect(screen.getByText(/Modal Body Content/i)).toBeInTheDocument();

      const closeButton = screen.getByLabelText(/Close modal/i);
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Hidden Content</p>
        </Modal>,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Skeleton & EmptyState', () => {
    it('renders Skeleton placeholder', () => {
      const { container } = render(<Skeleton className="w-20 h-4" />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders EmptyState with title, description, and action button', () => {
      render(
        <EmptyState
          title="No listings found"
          description="Try broadening your search filters."
          action={<Button size="sm">Reset Filters</Button>}
        />,
      );
      expect(screen.getByText(/No listings found/i)).toBeInTheDocument();
      expect(screen.getByText(/Try broadening your search filters/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Filters/i })).toBeInTheDocument();
    });
  });
});
