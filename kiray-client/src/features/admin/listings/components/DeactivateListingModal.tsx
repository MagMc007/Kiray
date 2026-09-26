'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useDeactivateListingMutation } from '@/features/admin/listings/adminListingApi';
import type { Listing, PopulatedListing } from '@/types/listing';

interface DeactivateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | PopulatedListing | null;
  onSuccess?: () => void;
}

export const DeactivateListingModal: React.FC<DeactivateListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [deactivateListing, { isLoading }] = useDeactivateListingMutation();

  useEffect(() => {
    if (listing) {
      setReason('');
      setFormError(null);
    }
  }, [listing, isOpen]);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reason.trim()) {
      setFormError('An administrative takedown reason is required.');
      return;
    }

    try {
      await deactivateListing({
        id: listing._id,
        reason: reason.trim(),
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.message || 'Failed to deactivate listing.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Takedown Rental Listing"
      description="Remove this listing from public search and mark it as deactivated by admin"
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-testid="deactivate-listing-modal-form"
      >
        {/* Error Alert */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="deactivate-form-error"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Listing Summary Preview */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
          {listing.images?.[0]?.url && (
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          )}
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
              {listing.title}
            </div>
            <div className="text-[11px] text-stone-500">
              {listing.address?.neighborhood || listing.address?.city} • ETB{' '}
              {listing.price?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Administrative Takedown Reason <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Specify why this listing is being removed (e.g. Terms violation, reported scam, misleading pricing)..."
            className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
            data-testid="deactivate-reason-input"
          />
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Deactivating will hide this property from all renter searches and search engines. You can restore it later if the owner resolves the issue.
          </div>
        </div>

        {/* Actions */}
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
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            data-testid="confirm-deactivate-btn"
          >
            {isLoading ? 'Deactivating...' : 'Confirm Takedown'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
