'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Listing } from '@/types/listing';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useFlagListingMutation } from '../reportsApi';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface ReportModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const REPORT_REASONS = [
  'Middleman / broker demanding illegal fee (violates direct owner policy)',
  'Scam attempt: Landlord asked for advance money before viewing',
  'Inaccurate photos or false property details',
  'Phone number or WhatsApp belongs to another person',
  'Property already rented or unavailable',
  'Other issue',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [flagListing, { isLoading }] = useFlagListingMutation();

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setErrorMessage(null);
      setDetails('');
      setSelectedReason(REPORT_REASONS[0]);
    }
  }, [isOpen]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const combinedReason = details.trim()
      ? `${selectedReason} - ${details.trim()}`
      : selectedReason;

    try {
      await flagListing({
        listingId: listing._id,
        reason: combinedReason,
      }).unwrap();

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit report. Please try again.';
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div
      id="report-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="report-modal-content"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200 p-6"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close report modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">
              Report Received
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Thank you for keeping Kiray safe. Our moderation team reviews flagged listings
              within 2 hours to prevent scams and unauthorized broker commissions.
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Sign in to Report This Listing
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Kiray protects direct owners and renters by preventing automated abuse. Please sign in to flag suspicious activities or unauthorized brokers.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
              >
                <span>Sign In / Register</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-lg text-slate-900 truncate">
                  Report Suspicious Listing
                </h3>
                <p className="text-xs text-stone-500 truncate">
                  Listing: <span className="font-semibold text-slate-700">{listing.title}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200">
              Kiray exists to eliminate middlemen and commissions in Addis Ababa. If someone
              claiming to be a broker or demanding an unauthorized finder&apos;s fee contacted you,
              report it here immediately.
            </p>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                What is the issue?
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                      selectedReason === reason
                        ? 'bg-orange-50 border-orange-400 text-orange-900 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 accent-orange-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="report-details" className="block text-xs font-bold text-slate-800 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="report-details"
                rows={2}
                placeholder="Provide any details (e.g. broker name, phone number used, fee requested)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
