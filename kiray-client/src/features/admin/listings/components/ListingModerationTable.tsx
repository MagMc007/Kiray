'use client';

import React, { useState } from 'react';
import {
  Search,
  Building,
  Check,
  Sparkles,
  AlertTriangle,
  Eye,
  Sliders,
  Ban,
  Trash2,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useListAdminListingsQuery,
  useVerifyListingMutation,
  useFeatureListingMutation,
  useRestoreListingMutation,
} from '@/features/admin/listings/adminListingApi';
import { formatETB } from '@/lib/format';
import { DeactivateListingModal } from './DeactivateListingModal';
import { HardDeleteListingModal } from './HardDeleteListingModal';
import { ListingOverrideModal } from './ListingOverrideModal';
import { AdminListingDetailDrawer } from './AdminListingDetailDrawer';
import type { Listing, ListingStatus, PopulatedListing } from '@/types/listing';

export const ListingModerationTable: React.FC = () => {
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus | 'all'>('all');
  const [isFlaggedOnly, setIsFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selected Listing for Modals / Drawer
  const [deactivateListingItem, setDeactivateListingItem] = useState<PopulatedListing | null>(null);
  const [hardDeleteListingItem, setHardDeleteListingItem] = useState<PopulatedListing | null>(null);
  const [overrideListingItem, setOverrideListingItem] = useState<PopulatedListing | null>(null);
  const [detailListingId, setDetailListingId] = useState<string | null>(null);

  // RTK Query
  const { data, isLoading, isFetching, isError, refetch } = useListAdminListingsQuery({
    page,
    limit,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    isFlagged: isFlaggedOnly ? true : undefined,
    search: search.trim() || undefined,
  });

  const [verifyListing, { isLoading: isVerifying }] = useVerifyListingMutation();
  const [featureListing, { isLoading: isFeaturing }] = useFeatureListingMutation();
  const [restoreListing] = useRestoreListingMutation();

  const listings = data?.listings || [];
  const meta = data?.meta || { page: 1, limit, total: 0, totalPages: 1 };
  const totalPages = meta.totalPages ?? 1;

  const handleToggleVerify = async (l: PopulatedListing) => {
    await verifyListing({ id: l._id, isVerified: !l.isVerified });
  };

  const handleToggleFeature = async (l: PopulatedListing) => {
    await featureListing({ id: l._id, isFeatured: !l.isFeatured });
  };

  const handleRestore = async (l: PopulatedListing) => {
    if (confirm(`Restore listing "${l.title}" back to active status?`)) {
      await restoreListing(l._id);
      refetch();
    }
  };

  return (
    <div className="space-y-6" data-testid="listing-moderation-container">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/80 text-orange-800 text-[11px] font-bold mb-1">
            <Building className="w-3 h-3 text-orange-600" />
            <span>Inventory Control</span>
          </div>
          <h2 className="font-display font-extrabold text-slate-900 text-xl">
            Listing Moderation &amp; Direct Owner Verification
          </h2>
          <p className="text-xs text-stone-500">
            Verify landlord ownership, feature premium rentals, and take down listings violating platform guidelines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, neighborhood, owner..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white"
              data-testid="listing-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as ListingStatus | 'all');
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white outline-none cursor-pointer"
            data-testid="listing-status-filter"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="rented">Rented</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {/* Flagged Filter Toggle */}
          <label
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 select-none ${
              isFlaggedOnly
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
            data-testid="flagged-toggle-filter"
          >
            <input
              type="checkbox"
              checked={isFlaggedOnly}
              onChange={(e) => {
                setIsFlaggedOnly(e.target.checked);
                setPage(1);
              }}
              className="sr-only"
            />
            <AlertTriangle className={`w-3.5 h-3.5 ${isFlaggedOnly ? 'text-rose-600' : 'text-stone-400'}`} />
            <span>Flagged Only</span>
          </label>

          <span
            className="text-xs text-stone-600 font-bold bg-stone-100 px-3 py-2 rounded-xl whitespace-nowrap"
            data-testid="total-listings-pill"
          >
            {meta.total} listings
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4"
          data-testid="listing-table-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs sm:text-sm">Failed to load listings from server.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Listings List */}
      <div className="space-y-3" data-testid="listing-moderation-list">
        {isLoading || isFetching ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-4"
            >
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-44 rounded-xl" />
            </div>
          ))
        ) : listings.length === 0 ? (
          // Empty State
          <div
            className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-2xs"
            data-testid="listing-table-empty"
          >
            <Building className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No rental listings match criteria</p>
            <p className="text-xs text-stone-500">
              Try refining your search terms or clearing your status and flagged filters.
            </p>
          </div>
        ) : (
          // Listing Rows
          listings.map((l) => {
            const owner = typeof l.ownerId === 'object' ? l.ownerId : null;
            return (
              <div
                key={l._id}
                className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-stone-300 transition"
                data-testid={`listing-row-${l._id}`}
              >
                {/* Thumbnail & Specs */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={
                      l.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
                    }
                    alt={l.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-sm">
                        {l.title}
                      </h4>

                      {l.isVerified && (
                        <span
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1"
                          data-testid={`verified-badge-${l._id}`}
                        >
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      )}

                      {l.isFeatured && (
                        <span
                          className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1"
                          data-testid={`featured-badge-${l._id}`}
                        >
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}

                      {l.isFlagged && (
                        <span
                          className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center gap-1"
                          data-testid={`flagged-badge-${l._id}`}
                        >
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}

                      {l.deactivatedByAdmin && (
                        <span className="px-2 py-0.5 bg-rose-200 text-rose-900 text-[10px] font-bold rounded-full">
                          Takedown
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 truncate">
                      {l.address?.neighborhood || l.address?.city} • Landlord:{' '}
                      <span className="font-semibold text-slate-700">
                        {owner?.displayName || 'Unknown'}
                      </span>{' '}
                      • <span className="font-bold text-slate-900">{formatETB(l.price)}/mo</span>
                    </p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Verify Toggle */}
                  <button
                    onClick={() => handleToggleVerify(l)}
                    disabled={isVerifying}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                      l.isVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                    }`}
                    data-testid={`toggle-verify-btn-${l._id}`}
                    title="Toggle landlord verification"
                  >
                    <Check className="w-3 h-3" />
                    <span>{l.isVerified ? 'Verified' : 'Verify'}</span>
                  </button>

                  {/* Feature Toggle */}
                  <button
                    onClick={() => handleToggleFeature(l)}
                    disabled={isFeaturing}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                      l.isFeatured
                        ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                    }`}
                    data-testid={`toggle-feature-btn-${l._id}`}
                    title="Toggle featured status"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{l.isFeatured ? 'Featured' : 'Feature'}</span>
                  </button>

                  {/* Inspect Details */}
                  <button
                    onClick={() => setDetailListingId(l._id)}
                    className="p-2 text-stone-600 hover:text-orange-600 bg-stone-100 hover:bg-orange-50 rounded-xl transition cursor-pointer"
                    title="Inspect Listing Details & Reports"
                    data-testid={`view-listing-btn-${l._id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Override Details */}
                  <button
                    onClick={() => setOverrideListingItem(l)}
                    className="p-2 text-stone-600 hover:text-blue-600 bg-stone-100 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                    title="Override Listing Details"
                    data-testid={`override-listing-btn-${l._id}`}
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  {/* Takedown / Restore */}
                  {l.deactivatedByAdmin || l.isDeleted ? (
                    <button
                      onClick={() => handleRestore(l)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition cursor-pointer flex items-center gap-1"
                      data-testid={`restore-listing-btn-${l._id}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeactivateListingItem(l)}
                      className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
                      data-testid={`takedown-listing-btn-${l._id}`}
                    >
                      Takedown
                    </button>
                  )}

                  {/* Permanent Hard Delete */}
                  <button
                    onClick={() => setHardDeleteListingItem(l)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Permanent Delete"
                    data-testid={`hard-delete-btn-${l._id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between gap-4 pt-2 text-xs"
          data-testid="listing-pagination"
        >
          <span className="text-stone-500 font-medium">
            Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({meta.total} total listings)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1 || isFetching}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 font-bold disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              data-testid="pagination-prev"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={meta.page >= totalPages || isFetching}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 font-bold disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              data-testid="pagination-next"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawer */}
      <DeactivateListingModal
        isOpen={Boolean(deactivateListingItem)}
        onClose={() => setDeactivateListingItem(null)}
        listing={deactivateListingItem}
        onSuccess={() => refetch()}
      />

      <HardDeleteListingModal
        isOpen={Boolean(hardDeleteListingItem)}
        onClose={() => setHardDeleteListingItem(null)}
        listing={hardDeleteListingItem}
        onSuccess={() => refetch()}
      />

      <ListingOverrideModal
        isOpen={Boolean(overrideListingItem)}
        onClose={() => setOverrideListingItem(null)}
        listing={overrideListingItem}
        onSuccess={() => refetch()}
      />

      <AdminListingDetailDrawer
        isOpen={Boolean(detailListingId)}
        onClose={() => setDetailListingId(null)}
        listingId={detailListingId}
        onOpenOverrideModal={(l) => setOverrideListingItem(l)}
        onOpenDeactivateModal={(l) => setDeactivateListingItem(l)}
        onOpenHardDeleteModal={(l) => setHardDeleteListingItem(l)}
      />
    </div>
  );
};
