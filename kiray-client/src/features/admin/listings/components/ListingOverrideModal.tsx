'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Sliders, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useOverrideListingMutation } from '@/features/admin/listings/adminListingApi';
import type { Listing, ListingStatus, PopulatedListing } from '@/types/listing';

interface ListingOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | PopulatedListing | null;
  onSuccess?: () => void;
}

export const ListingOverrideModal: React.FC<ListingOverrideModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ListingStatus>('open');
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [overrideListing, { isLoading }] = useOverrideListingMutation();

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '');
      setPrice(listing.price || 0);
      setDescription(listing.description || '');
      setStatus(listing.status || 'open');
      setIsVerified(Boolean(listing.isVerified));
      setIsFeatured(Boolean(listing.isFeatured));
      setFormError(null);
    }
  }, [listing, isOpen]);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }
    if (price <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }

    try {
      await overrideListing({
        id: listing._id,
        body: {
          title: title.trim(),
          price,
          description: description.trim(),
          status,
          isVerified,
          isFeatured,
        },
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.message || 'Failed to override listing.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Listing Override"
      description="Directly override title, pricing, status, and verification badges"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="listing-override-modal-form">
        {/* Error Alert */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="override-form-error"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Listing Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white"
            data-testid="override-title-input"
            required
          />
        </div>

        {/* Price & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Monthly Rent (ETB)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={1}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white"
              data-testid="override-price-input"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus)}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white cursor-pointer"
              data-testid="override-status-select"
            >
              <option value="open">Open (Available)</option>
              <option value="rented">Rented</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white"
            data-testid="override-description-input"
          />
        </div>

        {/* Verification & Featured Badges */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              data-testid="override-verified-checkbox"
            />
            <span className="flex items-center gap-1 text-emerald-700">
              <Check className="w-3.5 h-3.5" /> Verified Landlord Property
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              data-testid="override-featured-checkbox"
            />
            <span className="flex items-center gap-1 text-amber-700">
              <Sparkles className="w-3.5 h-3.5" /> Featured Rental
            </span>
          </label>
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
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            data-testid="save-override-btn"
          >
            {isLoading ? 'Saving...' : 'Save Overrides'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
