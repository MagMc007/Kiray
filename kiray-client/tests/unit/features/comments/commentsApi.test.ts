import { describe, it, expect } from 'vitest';
import { commentsApi } from '@/features/comments/commentsApi';

describe('commentsApi', () => {
  it('defines getComments query endpoint', () => {
    expect(commentsApi.endpoints.getComments).toBeDefined();
    expect(typeof commentsApi.endpoints.getComments.initiate).toBe('function');
  });

  it('defines addComment mutation endpoint', () => {
    expect(commentsApi.endpoints.addComment).toBeDefined();
    expect(typeof commentsApi.endpoints.addComment.initiate).toBe('function');
  });

  it('defines updateComment mutation endpoint', () => {
    expect(commentsApi.endpoints.updateComment).toBeDefined();
    expect(typeof commentsApi.endpoints.updateComment.initiate).toBe('function');
  });

  it('defines deleteComment mutation endpoint', () => {
    expect(commentsApi.endpoints.deleteComment).toBeDefined();
    expect(typeof commentsApi.endpoints.deleteComment.initiate).toBe('function');
  });

  it('normalizes backend comments and pagination envelope into PaginatedComments', async () => {
    const { transformCommentsResponse } = await import('@/features/comments/commentsApi');

    const backendEnvelope = {
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        comments: [
          {
            _id: 'c1',
            listingId: 'l1',
            authorId: 'u1',
            rating: 5,
            text: 'Great property!',
            verifiedRentee: true,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    };

    const result = transformCommentsResponse(backendEnvelope);
    expect(result.results).toHaveLength(1);
    expect(result.data).toHaveLength(1);
    expect(result.results[0].text).toBe('Great property!');
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
  });
});
