'use client';

import React, { useEffect, useCallback } from 'react';
import {
  X,
  Building,
  Check,
  Sparkles,
  AlertTriangle,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Trash2,
  RotateCcw,
  Sliders,
  Ban,
  User,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useGetAdminListingDetailQuery,
  useVerifyListingMutation,
  useFeatureListingMutation,
  useRestoreListingMutation,
} from '@/features/admin/listings/adminListingApi';
import { formatETB, formatDate } from '@/lib/format';
import type { Listing, PopulatedListing } from '@/types/listing';

interface AdminListingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string | null;
  onOpenOverrideModal: (listing: PopulatedListing) => void;
  onOpenDeactivateModal: (listing: PopulatedListing) => void;
  onOpenHardDeleteModal: (listing: PopulatedListing) => void;
}

export const AdminListingDetailDrawer: React.FC<AdminListingDetailDrawerProps> = ({
  isOpen,
  onClose,
  listingId,
  onOpenOverrideModal,
  onOpenDeactivateModal,
  onOpenHardDeleteModal,
}) => {
  const { data: detailData, isLoading, isError, refetch } = useGetAdminListingDetailQuery(
    listingId || '',
    { skip: !listingId || !isOpen }
  );

  const [verifyListing, { isLoading: isVerifying }] = useVerifyListingMutation();
  const [featureListing, { isLoading: isFeaturing }] = useFeatureListingMutation();
  const [restoreListing, { isLoading: isRestoring }] = useRestoreListingMutation();

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

  const listing = detailData?.listing;
  const reports = detailData?.reports || [];
  const owner = typeof listing?.ownerId === 'object' ? listing.ownerId : null;

  const handleToggleVerify = async () => {
    if (!listing) return;
    await verifyListing({ id: listing._id, isVerified: !listing.isVerified });
  };

  const handleToggleFeature = async () => {
    if (!listing) return;
    await featureListing({ id: listing._id, isFeatured: !listing.isFeatured });
  };

  const handleRestore = async () => {
    if (!listing) return;
    if (confirm(`Restore listing "${listing.title}" back to active standing?`)) {
      await restoreListing(listing._id);
      refetch();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
      data-testid="admin-listing-detail-drawer"
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
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                Inventory Inspection
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Listing &amp; Moderation Detail
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              aria-label="Close listing details"
              data-testid="close-listing-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4" data-testid="listing-detail-loading">
                <Skeleton className="w-full h-48 rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              </div>
            ) : isError || !listing ? (
              <div className="p-6 text-center space-y-3" data-testid="listing-detail-error">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-stone-600 font-medium">
                  Failed to load listing moderation details.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1.5 text-xs font-bold bg-orange-600 text-white rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Images Preview */}
                <div className="space-y-2">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={
                        listing.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {listing.images && listing.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {listing.images.slice(1).map((img, i) => (
                        <img
                          key={img.publicId || i}
                          src={img.url}
                          alt=""
                          className="w-16 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Title & Badges */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 capitalize">
                      {listing.propertyType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        listing.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {listing.status}
                    </span>
                    {listing.isVerified && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {listing.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {listing.isFlagged && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                    {listing.deactivatedByAdmin && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-200 text-rose-900">
                        Admin Takedown
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    {listing.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {listing.address?.neighborhood}, {listing.address?.city}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-base">
                      {formatETB(listing.price)}
                      <span className="text-xs text-stone-400 font-normal">/mo</span>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                  <div className="space-y-0.5">
                    <Bed className="w-4 h-4 text-stone-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {listing.bedrooms} Beds
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Bath className="w-4 h-4 text-stone-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {listing.bathrooms} Baths
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Maximize2 className="w-4 h-4 text-stone-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {listing.area ? `${listing.area} ${listing.areaUnit}` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Landlord Information */}
                {owner && (
                  <div className="p-3.5 rounded-2xl border border-stone-200 space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Property Owner / Landlord
                    </h4>
                    <div className="flex items-center gap-3">
                      {owner.photoURL ? (
                        <img
                          src={owner.photoURL}
                          alt={owner.displayName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                          {owner.displayName?.[0] || 'L'}
                        </div>
                      )}
                      <div className="text-xs flex-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{owner.displayName}</span>
                          {owner.isVerified && (
                            <Check className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-stone-500">{owner.email}</div>
                        {owner.phone && (
                          <div className="text-stone-600 font-mono text-[11px]">
                            {owner.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Moderation Reports Section */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Moderation Reports ({reports.length})
                    </h4>
                    {listing.flagReason && (
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                        Reason: {listing.flagReason}
                      </span>
                    )}
                  </div>

                  {reports.length === 0 ? (
                    <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                      No renter flags or moderation reports submitted for this listing.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reports.map((rep) => {
                        const reporter =
                          typeof rep.reporterId === 'object' ? rep.reporterId : null;
                        return (
                          <div
                            key={rep._id}
                            className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
                              <span>{rep.reason}</span>
                              <span className="text-stone-400 font-normal">
                                {formatDate(rep.createdAt)}
                              </span>
                            </div>
                            {rep.details && (
                              <p className="text-stone-600 text-[11px]">&quot;{rep.details}&quot;</p>
                            )}
                            {reporter && (
                              <div className="text-[10px] text-stone-500">
                                Filed by: {reporter.displayName || reporter.email}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action CTAs at bottom */}
          {listing && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleToggleVerify}
                  disabled={isVerifying}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer border flex items-center justify-center gap-1.5 ${
                    listing.isVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                  }`}
                  data-testid="drawer-verify-btn"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{listing.isVerified ? 'Verified' : 'Verify Listing'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFeature}
                  disabled={isFeaturing}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer border flex items-center justify-center gap-1.5 ${
                    listing.isFeatured
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                  }`}
                  data-testid="drawer-feature-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{listing.isFeatured ? 'Featured' : 'Feature Listing'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenOverrideModal(listing)}
                  className="px-2.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  data-testid="drawer-override-btn"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Override</span>
                </button>

                {listing.deactivatedByAdmin || listing.isDeleted ? (
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="px-2.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    data-testid="drawer-restore-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenDeactivateModal(listing)}
                    className="px-2.5 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    data-testid="drawer-takedown-btn"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>Takedown</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenHardDeleteModal(listing)}
                  className="px-2.5 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  data-testid="drawer-hard-delete-btn"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Purge</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
