'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertOctagon, Trash2, ShieldAlert } from 'lucide-react';
import { useHardDeleteListingMutation } from '@/features/admin/listings/adminListingApi';
import type { Listing, PopulatedListing } from '@/types/listing';

interface HardDeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | PopulatedListing | null;
  onSuccess?: () => void;
}

export const HardDeleteListingModal: React.FC<HardDeleteListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [hardDelete, { isLoading }] = useHardDeleteListingMutation();

  useEffect(() => {
    if (listing) {
      setConfirmText('');
      setFormError(null);
    }
  }, [listing, isOpen]);

  if (!listing) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    try {
      await hardDelete(listing._id).unwrap();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.message || 'Failed to permanently delete listing.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanently Delete Listing"
      description="Irreversible destructive action - destroys database record and Cloudinary assets"
      maxWidth="md"
    >
      <form onSubmit={handleDelete} className="space-y-4" data-testid="hard-delete-modal-form">
        {/* Error Alert */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="hard-delete-error"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Severe Warning Alert */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Permanent Deletion Warning</span>
          </div>
          <p className="leading-relaxed">
            You are about to permanently purge <span className="font-bold">"{listing.title}"</span>. This will destroy all associated images, moderation logs, and records. This action <span className="underline font-bold">cannot</span> be undone.
          </p>
        </div>

        {/* Typed Confirmation Field */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-700">
            Please type <span className="font-mono text-rose-600 font-extrabold select-all">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to enable"
            className="w-full p-2.5 text-xs font-mono rounded-xl border border-stone-300 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
            data-testid="hard-delete-confirm-input"
          />
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
            disabled={!isConfirmed || isLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            data-testid="confirm-hard-delete-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Purging...' : 'Permanently Delete'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
