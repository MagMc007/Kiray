'use client';

import React, { useState } from 'react';
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import { AdminLogoutButton } from '@/features/admin/shared/components/AdminLogoutButton';
import { useGetDashboardQuery } from '@/features/admin/dashboard/adminDashboardApi';
import { useGetFlaggedListingsQuery } from '@/features/admin/moderation/adminModerationApi';
import { FlaggedQueueTable } from '@/features/admin/moderation/components/FlaggedQueueTable';
import { ListingReportsDrawer } from '@/features/admin/moderation/components/ListingReportsDrawer';
import { ResolveFlagModal } from '@/features/admin/moderation/components/ResolveFlagModal';
import type { FlaggedListing, FlaggedListingSummary } from '@/types/admin';

export default function AdminFlaggedPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: metrics } = useGetDashboardQuery();

  const [page, setPage] = useState(1);
  const limit = 15;

  const [inspectListingId, setInspectListingId] = useState<string | null>(null);
  const [resolveListing, setResolveListing] = useState<
    FlaggedListing | FlaggedListingSummary | null
  >(null);

  const {
    data: flaggedData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFlaggedListingsQuery({ page, limit });

  const listings = flaggedData?.listings || [];
  const meta = flaggedData?.meta || { page: 1, limit, total: 0, totalPages: 1 };
  const totalPages = meta.totalPages || 1;

  const handleOpenResolveFromDrawer = (listingSummary: FlaggedListingSummary) => {
    setInspectListingId(null);
    setResolveListing(listingSummary);
  };

  return (
    <div className="space-y-8" data-testid="admin-flagged-page">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Trust &amp; Safety Moderation
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Community reports, safety flags, and listing compliance verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white text-xs font-semibold border border-slate-800 transition cursor-pointer"
            title="Refresh flagged queue"
            data-testid="refresh-flagged-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
            Live Moderation Queue
          </span>
          <AdminLogoutButton />
        </div>
      </div>

      {/* SHARED MODULE NAVIGATION */}
      <AdminHeaderNav pendingReportsCount={metrics?.reports?.pending} />

      {/* MODERATION GUIDANCE BANNER */}
      <div className="p-4 bg-orange-50 border border-orange-200/90 rounded-2xl flex items-start gap-3 text-xs text-orange-950">
        <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Community Safety Standard:</strong> Kiray strictly investigates listings reported for
          unlicensed street-broker commissions (delalas demanding viewing fees), misleading rental prices, or inaccurate Mapbox coordinates.
          Verify ownership before dismissing or deactivating properties.
        </div>
      </div>

      {/* QUEUE TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <span>Flagged Properties</span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-mono text-[10px] font-bold">
              {meta.total} in queue
            </span>
          </div>
          {isFetching && (
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Updating...</span>
            </span>
          )}
        </div>

        <FlaggedQueueTable
          listings={listings}
          isLoading={isLoading}
          onInspectReports={(listing) => setInspectListingId(listing._id)}
          onResolveFlags={(listing) => setResolveListing(listing)}
        />

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-stone-500">
              Page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> ({meta.total} listings)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                data-testid="flagged-prev-page-btn"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                data-testid="flagged-next-page-btn"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT REPORTS DRAWER */}
      <ListingReportsDrawer
        isOpen={Boolean(inspectListingId)}
        onClose={() => setInspectListingId(null)}
        listingId={inspectListingId}
        onOpenResolveModal={handleOpenResolveFromDrawer}
      />

      {/* RESOLVE FLAGS MODAL */}
      <ResolveFlagModal
        isOpen={Boolean(resolveListing)}
        onClose={() => setResolveListing(null)}
        listing={resolveListing}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
