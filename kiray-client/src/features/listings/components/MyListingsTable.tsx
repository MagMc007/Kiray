'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Listing, ListingStatus } from '@/types/listing';
import {
  useUpdateListingStatusMutation,
  useDeleteListingMutation,
  useRestoreListingMutation,
} from '@/features/listings/listingsApi';
import {
  Building,
  Eye,
  Heart,
  PhoneCall,
  ExternalLink,
  Edit3,
  Trash2,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { formatETB } from '@/lib/format';
import { useTranslation } from '@/i18n';

export interface MyListingsTableProps {
  listings: Listing[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onSelectListing?: (listing: Listing) => void;
  isLimitReached?: boolean;
  maxLimit?: number;
}

type StatusFilter = 'all' | 'open' | 'rented' | 'unavailable' | 'deleted';

export const MyListingsTable: React.FC<MyListingsTableProps> = ({
  listings = [],
  isLoading = false,
  onRefresh,
  onSelectListing,
  isLimitReached = false,
  maxLimit = 10,
}) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Mutations
  const [updateListingStatus, { isLoading: isUpdatingStatus }] = useUpdateListingStatusMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
  const [restoreListing, { isLoading: isRestoring }] = useRestoreListingMutation();

  // Filter listings based on selected pill
  const filteredListings = listings.filter((item) => {
    if (statusFilter === 'deleted') return item.isDeleted;
    if (item.isDeleted) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateListingStatus({ id: listingId, status: newStatus }).unwrap();
      setActionSuccess(`Listing status changed to "${newStatus}".`);
      setTimeout(() => setActionSuccess(null), 3000);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err?.data?.error || err?.message || 'Failed to update listing status.');
    }
  };

  const handleSoftDelete = async (listingId: string, title: string) => {
    if (!window.confirm(t.myListingsTable.confirmArchive.replace('{title}', title))) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteListing(listingId).unwrap();
      setActionSuccess(`Listing "${title}" archived.`);
      setTimeout(() => setActionSuccess(null), 3000);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err?.data?.error || err?.message || 'Failed to archive listing.');
    }
  };

  const handleRestore = async (listingId: string, title: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await restoreListing(listingId).unwrap();
      setActionSuccess(`Listing "${title}" restored to active status.`);
      setTimeout(() => setActionSuccess(null), 3000);
      onRefresh?.();
    } catch (err: any) {
      setActionError(err?.data?.error || err?.message || 'Failed to restore listing.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Feedback Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { label: t.myListingsTable.allActive, value: 'all' as StatusFilter },
            { label: t.myListingsTable.openAvailable, value: 'open' as StatusFilter },
            { label: t.myListingsTable.rented, value: 'rented' as StatusFilter },
            { label: t.myListingsTable.unavailable, value: 'unavailable' as StatusFilter },
            { label: t.myListingsTable.archived, value: 'deleted' as StatusFilter },
          ].map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setStatusFilter(pill.value)}
              className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                statusFilter === pill.value
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500 font-semibold">
          {t.myListingsTable.showingProperties
            .replace('{count}', String(filteredListings.length))
            .replace(
              '{unit}',
              filteredListings.length === 1
                ? t.myListingsTable.unitProperty
                : t.myListingsTable.unitProperties
            )}
        </span>
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300 space-y-3">
          <Building className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">
            {t.myListingsTable.emptyTitle}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {t.myListingsTable.emptyDesc}
          </p>
          {isLimitReached ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-500 font-bold text-xs rounded-xl cursor-not-allowed border border-stone-300"
              title={`Maximum limit of ${maxLimit} listings reached`}
            >
              <Lock className="w-4 h-4 text-stone-500" />
              <span>
                {t.ownerDashboard.listingLimitReached
                  .replace('{count}', String(maxLimit))
                  .replace('{max}', String(maxLimit))}
              </span>
            </button>
          ) : (
            <Link
              href="/dashboard/landlord/listings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-orange-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.ownerDashboard.publishNewListing}</span>
            </Link>
          )}
        </div>
      ) : (
        /* Listings Cards List */
        <div className="space-y-4">
          {filteredListings.map((item) => {
            const coverImage =
              item.images && item.images.length > 0
                ? item.images[0].url
                : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={item._id}
                className={`p-4 sm:p-5 rounded-2xl border transition bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  item.isDeleted
                    ? 'opacity-65 bg-stone-50/80 border-dashed border-stone-300'
                    : 'border-stone-200 hover:border-orange-200'
                }`}
              >
                {/* Thumbnail & Property Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.isDeleted && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-rose-600">
                          {t.myListingsTable.archived}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {item.title}
                      </h3>
                      {!item.isDeleted && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md capitalize shrink-0 ${
                            item.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'rented'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status === 'open'
                            ? t.myListingsTable.openAvailable
                            : item.status === 'rented'
                            ? t.myListingsTable.rented
                            : t.myListingsTable.unavailable}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {item.address?.neighborhood || 'Bole'}, {item.address?.city || 'Addis Ababa'} •{' '}
                      {item.bedrooms} Beds • {item.bathrooms} Baths
                      {item.area ? ` • ${item.area} ${item.areaUnit || 'sqm'}` : ''}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold">
                      <span className="text-orange-600 font-extrabold">
                        {formatETB(item.price)} /mo
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        {t.myListingsTable.viewsCount.replace('{count}', String(item.viewCount || 0))}
                      </span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-stone-400" />
                        {t.myListingsTable.savesCount.replace('{count}', String(item.saveCount || 0))}
                      </span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
                        {t.myListingsTable.contactsCount.replace('{count}', String(item.contactClickCount || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* Status Dropdown */}
                  {!item.isDeleted && (
                    <select
                      value={item.status}
                      disabled={isUpdatingStatus}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value as ListingStatus)
                      }
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-slate-800 bg-stone-50 outline-none hover:bg-stone-100 transition cursor-pointer"
                    >
                      <option value="open">{t.myListingsTable.statusOpen}</option>
                      <option value="rented">{t.myListingsTable.statusRented}</option>
                      <option value="unavailable">{t.myListingsTable.statusUnavailable}</option>
                    </select>
                  )}

                  {/* Public Preview */}
                  <Link
                    href={`/listings/${item.slug || item._id}`}
                    onClick={() => onSelectListing?.(item)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-semibold text-xs transition flex items-center gap-1"
                    title={t.myListingsTable.previewTitle}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.myListingsTable.preview}</span>
                  </Link>

                  {/* Edit Flow */}
                  {!item.isDeleted && (
                    <Link
                      href={`/dashboard/landlord/listings/${item._id}/edit`}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1"
                      title={t.myListingsTable.editTitle}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.myListingsTable.edit}</span>
                    </Link>
                  )}

                  {/* Soft Delete (Archive) / Restore */}
                  {item.isDeleted ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(item._id, item.title)}
                      disabled={isRestoring}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      title={t.myListingsTable.restoreTitle}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.myListingsTable.restore}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSoftDelete(item._id, item.title)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      title={t.myListingsTable.archiveTitle}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.myListingsTable.archive}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
