import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { CommentItem } from '@/features/comments/components/CommentItem';
import { setCurrentUser, setStatus } from '@/features/auth/authSlice';
import type { Comment } from '@/types/comment';
import type { User } from '@/types/user';

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/sample-listing',
}));

describe('CommentItem Component', () => {
  const mockComment: Comment = {
    _id: 'comment_001',
    listingId: 'listing_001',
    authorId: {
      _id: 'user_001',
      displayName: 'Sara Tadesse',
      photoURL: null,
      role: 'rentee',
    },
    rating: 5,
    text: 'Wonderful place, very quiet neighborhood in Bole Olympia.',
    verifiedRentee: true,
    createdAt: '2026-01-01T12:00:00.000Z',
  };

  const authorUser: User = {
    _id: 'user_001',
    firebaseUid: 'fb_001',
    email: 'sara@example.com',
    displayName: 'Sara Tadesse',
    role: 'rentee',
    status: 'active',
    profileCompleted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders author display name, verified badge, stars, and text', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <CommentItem comment={mockComment} listingId="listing_001" />
      </Provider>
    );

    expect(screen.getByText('Sara Tadesse')).toBeInTheDocument();
    expect(screen.getByText(/Verified Renter/i)).toBeInTheDocument();
    expect(screen.getByText(/Wonderful place, very quiet neighborhood in Bole Olympia/i)).toBeInTheDocument();
  });

  it('shows edit and delete actions when logged in as author', () => {
    const store = makeStore();
    store.dispatch(setCurrentUser(authorUser));
    store.dispatch(setStatus('authenticated'));

    render(
      <Provider store={store}>
        <CommentItem comment={mockComment} listingId="listing_001" />
      </Provider>
    );

    const optionsBtn = screen.getByRole('button', { name: /Comment options/i });
    expect(optionsBtn).toBeInTheDocument();

    fireEvent.click(optionsBtn);
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });
});
