'use client';

import React, { useState } from 'react';
import type { Comment, CommentAuthor } from '@/types/comment';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser, selectIsAdmin } from '@/features/auth/authSlice';
import { RatingStars } from './RatingStars';
import { CommentForm } from './CommentForm';
import { formatRelativeTime } from '@/lib/format';
import { ShieldCheck, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';

export interface CommentItemProps {
  comment: Comment;
  listingId: string;
  onUpdate?: (commentId: string, data: { rating: number; text: string }) => Promise<void> | void;
  onDelete?: (commentId: string) => Promise<void> | void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  listingId,
  onUpdate,
  onDelete,
}) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Author details can be populated object or string ID
  const author =
    typeof comment.authorId === 'object' && comment.authorId !== null
      ? (comment.authorId as CommentAuthor)
      : null;

  const authorIdStr = author?._id || (typeof comment.authorId === 'string' ? comment.authorId : '');
  const isAuthor = Boolean(currentUser && (currentUser._id === authorIdStr || currentUser.displayName === author?.displayName));
  const canManage = isAuthor || isAdmin;

  const displayName = author?.displayName || author?.fullName || 'Verified Renter';
  const photoURL = author?.photoURL;
  const initial = displayName.charAt(0).toUpperCase();

  const handleUpdate = async (data: { rating: number; text: string }) => {
    if (onUpdate) {
      await onUpdate(comment._id, data);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(comment._id);
      } finally {
        setIsDeleting(false);
        setShowConfirmDelete(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-orange-200 p-4 shadow-xs">
        <CommentForm
          listingId={listingId}
          commentId={comment._id}
          initialRating={comment.rating}
          initialText={comment.text}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitButtonText="Save Changes"
        />
      </div>
    );
  }

  return (
    <div
      id={`comment-${comment._id}`}
      className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3 relative group transition hover:border-stone-300"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Author info */}
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border border-stone-200 shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-700 shadow-2xs">
              {initial}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-slate-900">
                {displayName}
              </span>
              {comment.verifiedRentee && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Renter
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Rating and optional actions menu */}
        <div className="flex items-center gap-2">
          <RatingStars rating={comment.rating} size="sm" />

          {canManage && (
            <div className="relative">
              <button
                type="button"
                aria-label="Comment options"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-7 w-32 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowConfirmDelete(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Body */}
      <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
        &ldquo;{comment.text}&rdquo;
      </p>

      {/* Delete Confirmation Modal / Prompt */}
      {showConfirmDelete && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
          <p className="text-xs font-semibold text-rose-800">
            Are you sure you want to delete this review?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Delete</span>
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
