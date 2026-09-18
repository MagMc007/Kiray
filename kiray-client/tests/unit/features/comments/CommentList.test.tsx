import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { CommentList } from '@/features/comments/components/CommentList';
import * as commentsApiModule from '@/features/comments/commentsApi';
import type { Comment } from '@/types/comment';

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings/bole-luxury',
}));

describe('CommentList Component', () => {
  const mockComments: Comment[] = [
    {
      _id: 'c1',
      listingId: 'l1',
      authorId: {
        _id: 'u1',
        displayName: 'Alemayehu',
        role: 'rentee',
      },
      rating: 5,
      text: 'Super clean and reliable power backup.',
      verifiedRentee: true,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      _id: 'c2',
      listingId: 'l1',
      authorId: {
        _id: 'u2',
        displayName: 'Marta',
        role: 'rentee',
      },
      rating: 4,
      text: 'Good location near Edna Mall.',
      verifiedRentee: false,
      createdAt: '2026-02-05T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reviews header and comments list', () => {
    vi.spyOn(commentsApiModule, 'useGetCommentsQuery').mockReturnValue({
      data: {
        results: mockComments,
        data: mockComments,
        meta: {
          page: 1,
          limit: 20,
          totalPages: 1,
          total: 2,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(commentsApiModule, 'useAddCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useUpdateCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useDeleteCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <CommentList listingId="l1" />
      </Provider>
    );

    expect(screen.getByText(/Reviews from Renters \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('Alemayehu')).toBeInTheDocument();
    expect(screen.getByText('Marta')).toBeInTheDocument();
    expect(screen.getByText(/Super clean and reliable power backup/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no comments', () => {
    vi.spyOn(commentsApiModule, 'useGetCommentsQuery').mockReturnValue({
      data: {
        results: [],
        data: [],
        meta: {
          page: 1,
          limit: 20,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(commentsApiModule, 'useAddCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useUpdateCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useDeleteCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <CommentList listingId="l1" />
      </Provider>
    );

    expect(screen.getByText(/No reviews yet for this listing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Leave First Review/i })).toBeInTheDocument();
  });

  it('toggles write review form when clicking button', () => {
    vi.spyOn(commentsApiModule, 'useGetCommentsQuery').mockReturnValue({
      data: {
        results: mockComments,
        data: mockComments,
        meta: {
          page: 1,
          limit: 20,
          totalPages: 1,
          total: 2,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(commentsApiModule, 'useAddCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useUpdateCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    vi.spyOn(commentsApiModule, 'useDeleteCommentMutation').mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as any);

    const store = makeStore();
    render(
      <Provider store={store}>
        <CommentList listingId="l1" />
      </Provider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Write a Review/i });
    fireEvent.click(toggleBtn);

    // When unauthenticated, CommentForm renders "Sign in to leave a review"
    expect(screen.getByText('Sign in to leave a review')).toBeInTheDocument();
  });
});
