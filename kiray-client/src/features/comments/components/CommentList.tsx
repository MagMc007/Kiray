'use client';

import React, { useState } from 'react';
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../commentsApi';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { RatingStars } from './RatingStars';
import {
  MessageSquare,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface CommentListProps {
  listingId: string;
  initialAverageRating?: number;
  initialTotalReviews?: number;
}

export const CommentList: React.FC<CommentListProps> = ({
  listingId,
  initialAverageRating,
  initialTotalReviews,
}) => {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError, refetch } = useGetCommentsQuery({
    listingId,
    page,
    limit: 10,
  });

  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const comments = data?.results || data?.data || (data as any)?.comments || [];
  const meta = data?.meta || {
    page: (data as any)?.pagination?.page ?? 1,
    totalPages: (data as any)?.pagination?.totalPages ?? 1,
    total: (data as any)?.pagination?.totalItems ?? comments.length,
    hasNextPage: (data as any)?.pagination?.hasNext ?? false,
    hasPrevPage: (data as any)?.pagination?.hasPrev ?? false,
  };

  const totalReviews =
    meta.total ?? initialTotalReviews ?? comments.length;

  const averageRating =
    initialAverageRating && initialAverageRating > 0

      ? initialAverageRating
      : comments.length > 0
      ? comments.reduce((acc:any, c:any) => acc + c.rating, 0) / comments.length
      : 0;

  const handleAddReview = async (formData: { rating: number; text: string }) => {
    await addComment({
      listingId,
      rating: formData.rating,
      text: formData.text,
    }).unwrap();
    setShowForm(false);
  };

  const handleUpdateReview = async (
    commentId: string,
    formData: { rating: number; text: string }
  ) => {
    await updateComment({
      listingId,
      commentId,
      rating: formData.rating,
      text: formData.text,
    }).unwrap();
  };

  const handleDeleteReview = async (commentId: string) => {
    await deleteComment({
      listingId,
      commentId,
    }).unwrap();
  };

  return (
    <section
      id="comments-section"
      aria-label="Renter Reviews"
      className="space-y-6 pt-8 border-t border-stone-200"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span>Reviews from Renters ({totalReviews})</span>
            </h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                <RatingStars rating={averageRating} size="sm" />
                <span className="text-xs font-extrabold text-amber-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Verified tenants and property viewers share authentic feedback about condition and responsiveness.
          </p>
        </div>

        <button
          type="button"
          id="toggle-write-review-btn"
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs ${
            showForm
              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              : 'bg-stone-900 hover:bg-orange-600 text-white'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </>
          )}
        </button>
      </div>

      {/* Review Form Drawer/Collapsible */}
      {showForm && (
        <CommentForm
          listingId={listingId}
          isSubmitting={isAdding}
          onSubmit={handleAddReview}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl border border-stone-200 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3 bg-stone-200 rounded" />
                  <div className="w-16 h-2 bg-stone-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-stone-200 rounded" />
                <div className="w-3/4 h-3 bg-stone-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Could not load comments right now.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline hover:text-amber-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && comments.length === 0 && (
        <div className="text-center py-10 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-sm text-slate-800">
            No reviews yet for this listing
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Have you inspected or lived in this property? Be the first to share helpful feedback for fellow renters in Addis Ababa!
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Leave First Review
            </button>
          )}
        </div>
      )}

      {/* Comments Grid */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comments.map((comment:any) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                listingId={listingId}
                onUpdate={handleUpdateReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {(meta.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
              <span className="text-stone-500">
                Page <strong className="text-slate-800">{meta.page}</strong> of{' '}
                <strong className="text-slate-800">{meta.totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
