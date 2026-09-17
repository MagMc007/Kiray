import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { CommentForm } from '@/features/comments/components/CommentForm';
import { setCurrentUser, setStatus } from '@/features/auth/authSlice';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/test-apartment',
}));

describe('CommentForm Component', () => {
  const mockUser: User = {
    _id: 'user_123',
    firebaseUid: 'fb_123',
    email: 'renter@kiray.et',
    displayName: 'Abebe Bikila',
    role: 'rentee',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders guest sign-in CTA when unauthenticated', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <CommentForm listingId="listing_1" onSubmit={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText('Sign in to leave a review')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In \/ Register/i })).toBeInTheDocument();
  });

  it('renders submission form and submits review when authenticated', async () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <Provider store={store}>
        <CommentForm listingId="listing_1" onSubmit={handleSubmit} />
      </Provider>
    );

    expect(screen.getByText('Share your rental experience')).toBeInTheDocument();
    expect(screen.getByText(/Posting as/i)).toBeInTheDocument();
    expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Your Review \/ Comments/i);
    fireEvent.change(textarea, {
      target: { value: 'Water supply is constant and landlord is very cooperative.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        rating: 5,
        text: 'Water supply is constant and landlord is very cooperative.',
      });
    });
  });

  it('validates empty review text', async () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(mockUser));
    store.dispatch(setStatus('authenticated'));

    const handleSubmit = vi.fn();

    render(
      <Provider store={store}>
        <CommentForm listingId="listing_1" onSubmit={handleSubmit} />
      </Provider>
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
