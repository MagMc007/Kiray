'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { RatingStars } from './RatingStars';
import { Send, Lock, AlertCircle, Loader2 } from 'lucide-react';

export interface CommentFormProps {
  listingId: string;
  initialRating?: number;
  initialText?: string;
  commentId?: string;
  isSubmitting?: boolean;
  onSubmit: (data: { rating: number; text: string }) => Promise<void> | void;
  onCancel?: () => void;
  submitButtonText?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  listingId,
  initialRating = 5,
  initialText = '',
  commentId,
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit Review',
}) => {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const [rating, setRating] = useState<number>(initialRating);
  const [text, setText] = useState<string>(initialText);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          Sign in to leave a review
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Only registered users can share their rental experiences to maintain an authentic and trusted community.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>Sign In / Register</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your review text.');
      return;
    }

    if (trimmed.length > 1000) {
      setErrorMessage('Review text cannot exceed 1000 characters.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      await onSubmit({ rating, text: trimmed });
      if (!commentId) {
        setText('');
        setRating(5);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string; message?: string } };
      setErrorMessage(
        errorObj?.data?.error ||
          errorObj?.data?.message ||
          'Failed to submit review. Please try again.'
      );
    }
  };

  const isEdit = Boolean(commentId);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">
          {isEdit ? 'Edit your review' : 'Share your rental experience'}
        </h4>
        {currentUser && (
          <span className="text-[11px] text-stone-500">
            Posting as <strong className="text-slate-800">{currentUser.displayName}</strong>
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-stone-700 block mb-1.5">
          Your Rating
        </label>
        <div className="flex items-center gap-3">
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          <span className="text-xs font-bold text-stone-700">
            {rating} of 5 Stars
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="comment-textarea"
            className="text-xs font-semibold text-stone-700 block"
          >
            Your Review / Comments
          </label>
          <span
            className={`text-[10px] ${
              text.length > 900 ? 'text-amber-600 font-bold' : 'text-stone-400'
            }`}
          >
            {text.length}/1000
          </span>
        </div>
        <textarea
          id="comment-textarea"
          rows={3}
          maxLength={1000}
          placeholder="Describe property condition, neighborhood safety, water/power reliability, landlord responsiveness..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 text-sm bg-white rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition placeholder:text-stone-400"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{submitButtonText}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
