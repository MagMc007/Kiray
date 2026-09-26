'use client';

import React, { useEffect, useCallback } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetListingFlagsQuery } from '@/features/admin/moderation/adminModerationApi';
import { formatDate } from '@/lib/format';
import type { FlaggedListingSummary } from '@/types/admin';
import type { Report } from '@/types/report';

interface ListingReportsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string | null;
  onOpenResolveModal: (listingSummary: FlaggedListingSummary) => void;
}

export const ListingReportsDrawer: React.FC<ListingReportsDrawerProps> = ({
  isOpen,
  onClose,
  listingId,
  onOpenResolveModal,
}) => {
  const { data, isLoading, isError } = useGetListingFlagsQuery(
    { id: listingId || '', page: 1, limit: 50 },
    { skip: !listingId || !isOpen }
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const listing = data?.listing;
  const reports = data?.reports || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
      data-testid="listing-reports-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Safety &amp; Compliance Reports
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {listing?.title || 'Listing Reports'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              aria-label="Close reports drawer"
              data-testid="close-reports-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {isLoading ? (
              <div className="space-y-4" data-testid="reports-loading-skeleton">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : isError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Failed to load safety reports for this property.</span>
              </div>
            ) : (
              <>
                {/* Listing Meta Card */}
                {listing && (
                  <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Listing Flag Summary
                      </span>
                      {listing.slug && (
                        <a
                          href={`/listings/${listing.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
                        >
                          <span>Live preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {listing.flagReason ? (
                      <p className="text-xs text-orange-950 font-medium">
                        Primary Reason: &ldquo;{listing.flagReason}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500">
                        Flagged by tenant community submissions.
                      </p>
                    )}
                    <div className="text-[11px] text-stone-600 font-mono">
                      ID: {listing._id}
                    </div>
                  </div>
                )}

                {/* Reports Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      User Complaints ({reports.length})
                    </h3>
                  </div>

                  {reports.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                      No active reports found on this listing.
                    </div>
                  ) : (
                    reports.map((report: Report) => {
                      const reporter =
                        typeof report.reporterId === 'object' && report.reporterId
                          ? report.reporterId
                          : null;
                      const reporterName = reporter?.displayName || 'Anonymous User';
                      const reporterEmail = reporter?.email;
                      const reporterRole = reporter?.role;

                      return (
                        <div
                          key={report._id}
                          data-testid={`report-card-${report._id}`}
                          className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">
                                  {reporterName}
                                </div>
                                <div className="text-[10px] text-stone-400">
                                  {reporterEmail || 'Reporter'}
                                  {reporterRole && ` • ${reporterRole}`}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                report.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : report.status === 'actioned'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>

                          {/* Reason Badge */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400 text-[11px]">Reason:</span>
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[11px]">
                              {report.reason}
                            </span>
                          </div>

                          {/* Notes / Details */}
                          {report.notes && (
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700 leading-relaxed text-[11px] flex items-start gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span>&ldquo;{report.notes}&rdquo;</span>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 pt-1 border-t border-stone-100">
                            <Clock className="w-3 h-3" />
                            <span>Submitted: {formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky Drawer Footer with Action Button */}
          {listing && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-slate-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenResolveModal(listing);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                data-testid="drawer-resolve-flags-btn"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve Flags</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
