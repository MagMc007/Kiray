'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { useResolveListingFlagsMutation } from '@/features/admin/moderation/adminModerationApi';
import type { FlaggedListing, FlaggedListingSummary } from '@/types/admin';
import type { Listing, PopulatedListing } from '@/types/listing';

interface ResolveFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing:
    | FlaggedListing
    | FlaggedListingSummary
    | Listing
    | PopulatedListing
    | null;
  onSuccess?: () => void;
}

type ResolveAction = 'dismiss' | 'deactivate' | 'restore';

export const ResolveFlagModal: React.FC<ResolveFlagModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [action, setAction] = useState<ResolveAction>('dismiss');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [resolveListingFlags, { isLoading }] = useResolveListingFlagsMutation();

  useEffect(() => {
    if (listing && isOpen) {
      setAction('dismiss');
      setNotes('');
      setFormError(null);
    }
  }, [listing, isOpen]);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await resolveListingFlags({
        id: listing._id,
        action,
        notes: notes.trim() || undefined,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.message || 'Failed to resolve listing flags.'
      );
    }
  };

  const actionOptions: {
    id: ResolveAction;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    activeBorder: string;
    activeBg: string;
  }[] = [
    {
      id: 'dismiss',
      title: 'Dismiss (False Alarm)',
      description: 'Clear the moderation flag and keep the listing in its current status.',
      icon: CheckCircle2,
      accentColor: 'text-emerald-600',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500',
      activeBg: 'bg-emerald-50/50',
    },
    {
      id: 'deactivate',
      title: 'Deactivate Listing (Takedown)',
      description: 'Resolve flags and immediately hide property from search as admin deactivated.',
      icon: Ban,
      accentColor: 'text-rose-600',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500',
      activeBg: 'bg-rose-50/50',
    },
    {
      id: 'restore',
      title: 'Restore to Active Standing',
      description: 'Clear flags and reset property status to open and active.',
      icon: RotateCcw,
      accentColor: 'text-blue-600',
      activeBorder: 'border-blue-500 ring-1 ring-blue-500',
      activeBg: 'bg-blue-50/50',
    },
  ];

  const listingImages = 'images' in listing && Array.isArray(listing.images) ? listing.images : [];
  const thumbnail = listingImages[0]?.url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Listing Flags"
      description="Select the moderation action to resolve safety reports on this listing"
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-testid="resolve-flag-modal-form"
      >
        {/* Error Alert */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="resolve-form-error"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Listing Preview Banner */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={listing.title}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold shrink-0">
              Kiray
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
              {listing.title}
            </div>
            {listing.flagReason && (
              <div className="text-[11px] text-rose-700 font-medium line-clamp-1 mt-0.5">
                Flag reason: &ldquo;{listing.flagReason}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Action Selection Radio Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Resolution Action <span className="text-rose-600">*</span>
          </label>
          <div className="space-y-2">
            {actionOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = action === opt.id;
              return (
                <label
                  key={opt.id}
                  data-testid={`action-${opt.id}`}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? `${opt.activeBorder} ${opt.activeBg}`
                      : 'border-stone-200 hover:bg-stone-50 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolve-action"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setAction(opt.id)}
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Icon className={`w-3.5 h-3.5 ${opt.accentColor}`} />
                      <span>{opt.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Administrative Resolution Notes{' '}
            <span className="text-stone-400 font-normal">(Optional, logged to audit history)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document resolution findings (e.g. Verified ownership deed, resolved broker commission complaint, false alarm)..."
            className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
            data-testid="resolve-notes-input"
          />
        </div>

        {/* Informational Guidance */}
        <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-950 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Resolving flags marks all pending user reports on this listing as resolved and logs an audit trail.
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 ${
              action === 'deactivate'
                ? 'bg-rose-600 hover:bg-rose-700'
                : action === 'restore'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            data-testid="confirm-resolve-btn"
          >
            {isLoading ? 'Processing...' : 'Confirm Resolution'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
