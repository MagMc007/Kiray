'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Check,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { useGetSavedListingsQuery } from '../favoritesApi';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { formatPrice } from '@/lib/format';
import type { Listing } from '@/types/listing';

export interface SavedListingsGridProps {
  onListingSelect?: (listing: Listing) => void;
  className?: string;
}

export const SavedListingsGrid: React.FC<SavedListingsGridProps> = ({
  onListingSelect,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<Listing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSavedListingsQuery({ page: currentPage, limit: 12 });

  const savedListings = data?.results || [];
  const meta = data?.meta;

  // Filter listings locally based on search query
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return savedListings;
    const query = searchQuery.toLowerCase().trim();
    return savedListings.filter((listing) => {
      const title = listing.title?.toLowerCase() || '';
      const neighborhood = listing.address?.neighborhood?.toLowerCase() || '';
      const city = listing.address?.city?.toLowerCase() || '';
      const propertyType = listing.propertyType?.toLowerCase() || '';
      return (
        title.includes(query) ||
        neighborhood.includes(query) ||
        city.includes(query) ||
        propertyType.includes(query)
      );
    });
  }, [savedListings, searchQuery]);

  // Comparison selection handling (max 3)
  const toggleCompare = (listing: Listing) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((item) => item._id === listing._id);
      if (exists) {
        return prev.filter((item) => item._id !== listing._id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, listing];
    });
  };

  const isSelectedForCompare = (listingId: string) => {
    return selectedForCompare.some((item) => item._id === listingId);
  };

  const clearCompare = () => {
    setSelectedForCompare([]);
    setIsCompareOpen(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search & Compare Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved homes by neighborhood, title..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition shadow-xs"
            >
              <Scale className="w-4 h-4" />
              <span>Compare ({selectedForCompare.length}/3)</span>
            </button>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh saved listings"
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-5 space-y-4">
                <div className="h-5 bg-stone-200 rounded-md w-3/4" />
                <div className="h-4 bg-stone-100 rounded-md w-1/2" />
                <div className="pt-3 border-t border-stone-100 flex justify-between">
                  <div className="h-4 bg-stone-200 rounded-md w-1/4" />
                  <div className="h-4 bg-stone-200 rounded-md w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">
            Failed to load your saved listings.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State (No saved listings at all) */}
      {!isLoading && !isError && savedListings.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-display font-bold text-lg text-slate-900">
              No saved listings yet
            </h3>
            <p className="text-xs text-stone-500">
              Explore verified Addis homes and tap the heart icon on any card to save your favorites here.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Browse Addis Homes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Empty Filter State (Search yielded 0 items) */}
      {!isLoading && !isError && savedListings.length > 0 && filteredListings.length === 0 && (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <p className="text-sm text-stone-600">
            No saved properties match <span className="font-semibold">&ldquo;{searchQuery}&rdquo;</span>.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && !isError && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const inCompare = isSelectedForCompare(listing._id);
            const canAddMoreCompare = selectedForCompare.length < 3 || inCompare;

            return (
              <div key={listing._id} className="relative group">
                <ListingCard
                  listing={listing}
                  onSelectListing={onListingSelect}
                />
                {/* Compare Checkbox Pill */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(listing);
                    }}
                    disabled={!canAddMoreCompare && !inCompare}
                    title={
                      inCompare
                        ? 'Remove from comparison'
                        : selectedForCompare.length >= 3
                        ? 'Maximum 3 properties compared'
                        : 'Add to compare'
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition shadow-xs ${
                      inCompare
                        ? 'bg-orange-600 text-white border border-orange-700'
                        : 'bg-white/90 text-stone-700 hover:bg-white border border-stone-200'
                    } ${!canAddMoreCompare && !inCompare ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <Scale className="w-3 h-3" />
                    <span>{inCompare ? 'Compared' : 'Compare'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !isError && meta && meta.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!meta.hasPrevPage}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
          >
            Previous
          </button>
          <span className="text-xs text-stone-500 font-medium px-2">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(meta.totalPages || 1, p + 1))}
            disabled={!meta.hasNextPage}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property Comparison"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-orange-600" />
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Compare Properties ({selectedForCompare.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCompare}
                  className="text-xs text-stone-500 hover:text-stone-700 font-medium px-2 py-1"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 transition"
                  aria-label="Close comparison"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedForCompare.map((item) => {
                const img = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688';
                return (
                  <div
                    key={item._id}
                    className="flex flex-col rounded-2xl border border-stone-200 overflow-hidden bg-stone-50"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                      <img
                        src={img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleCompare(item)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                          {item.propertyType}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {item.address?.neighborhood || item.address?.city}, {item.address?.city}
                          </span>
                        </div>
                      </div>

                      {/* Attribute Table */}
                      <div className="space-y-2 text-xs divide-y divide-stone-200/60 pt-2 border-t border-stone-200">
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Monthly Rent</span>
                          <span className="font-bold text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Bedrooms</span>
                          <span className="font-semibold text-slate-800">
                            {item.bedrooms ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Bathrooms</span>
                          <span className="font-semibold text-slate-800">
                            {item.bathrooms ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Area</span>
                          <span className="font-semibold text-slate-800">
                            {item.area ? `${item.area} ${item.areaUnit || 'sqm'}` : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Currency</span>
                          <span className="font-semibold text-slate-800">
                            {item.currency || 'ETB'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-stone-500">Furnished</span>
                          <span className="font-semibold text-slate-800">
                            {item.amenities?.includes('furnished') ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/listings/${item.slug || item._id}`}
                        className="block text-center w-full py-2 rounded-xl bg-stone-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
