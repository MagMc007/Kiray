import { baseApi, unwrapApiResponse } from '@/store/baseApi';
import type { ApiResponse, PaginatedMeta } from '@/types/api';
import type {
  Comment,
  CommentCreateInput,
  CommentUpdateInput,
  PaginatedComments,
} from '@/types/comment';

export interface GetCommentsParams {
  listingId: string;
  page?: number;
  limit?: number;
}

export interface AddCommentParams extends CommentCreateInput {
  listingId: string;
  verifiedRentee?: boolean;
}

export interface UpdateCommentParams extends CommentUpdateInput {
  listingId: string;
  commentId: string;
  verifiedRentee?: boolean;
}

export interface DeleteCommentParams {
  listingId: string;
  commentId: string;
}

export function transformCommentsResponse(
  response: ApiResponse<{
    comments?: Comment[];
    results?: Comment[];
    data?: Comment[];
    pagination?: {
      page?: number;
      totalPages?: number;
      totalItems?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
    meta?: PaginatedMeta;
  }>
): PaginatedComments {
  const payload = response.data;
  const items = payload?.comments || payload?.results || payload?.data || [];
  const pagination = payload?.pagination;
  const meta: PaginatedMeta = payload?.meta || {
    page: pagination?.page ?? 1,
    limit: 20,
    total: pagination?.totalItems ?? items.length,
    totalPages: pagination?.totalPages ?? 1,
    hasNextPage: pagination?.hasNext ?? false,
    hasPrevPage: pagination?.hasPrev ?? false,
  };

  return {
    results: items,
    data: items,
    meta,
  };
}

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<PaginatedComments, GetCommentsParams>({
      query: ({ listingId, page = 1, limit = 20 }) => ({
        url: `/listings/${listingId}/comments`,
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: transformCommentsResponse,
      providesTags: (result, _error, { listingId }) =>
        result
          ? [
              { type: 'Comment' as const, id: `LIST_${listingId}` },
              ...result.results.map((c) => ({
                type: 'Comment' as const,
                id: c._id,
              })),
            ]
          : [{ type: 'Comment' as const, id: `LIST_${listingId}` }],
    }),

    addComment: builder.mutation<Comment, AddCommentParams>({
      query: ({ listingId, ...body }) => ({
        url: `/listings/${listingId}/comments`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Comment>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: 'Comment', id: `LIST_${listingId}` },
        { type: 'Listing', id: listingId },
      ],
    }),

    updateComment: builder.mutation<Comment, UpdateCommentParams>({
      query: ({ listingId, commentId, ...body }) => ({
        url: `/listings/${listingId}/comments/${commentId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Comment>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { listingId, commentId }) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: `LIST_${listingId}` },
        { type: 'Listing', id: listingId },
      ],
    }),

    deleteComment: builder.mutation<{ message: string }, DeleteCommentParams>({
      query: ({ listingId, commentId }) => ({
        url: `/listings/${listingId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { listingId, commentId }) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: `LIST_${listingId}` },
        { type: 'Listing', id: listingId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useLazyGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
