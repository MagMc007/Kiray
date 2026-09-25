'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { QuickSearchBar } from '@/features/listings/components/QuickSearchBar';
import { AdvancedFilterPanel } from '@/features/listings/components/AdvancedFilterPanel';
import { MapboxView } from '@/features/map/components/MapboxView';
import { useFavorites } from '@/features/favorites';
import { useSearchListingsQuery } from '@/features/listings/listingsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setViewMode,
  setFilterModalOpen,
  type ViewMode,
} from '@/features/listings/listingsSlice';
import type { FilterState, Listing, ListingSearchParams } from '@/types/listing';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  SlidersHorizontal,
  Search,
  Sparkles,
} from 'lucide-react';

function ListingsBrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const viewMode = useAppSelector((state) => state.listings.viewMode);
  const isFilterModalOpen = useAppSelector((state) => state.listings.isFilterModalOpen);

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { isSaved, toggleFavorite, savedCount } = useFavorites();

  // Parse filters from URL search params
  const currentFilters: FilterState = useMemo(() => {
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || 'Addis Ababa';
    const neighborhood = searchParams.get('neighborhood') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 0;
    const bedrooms = searchParams.get('bedrooms') || 'all';
    const bathrooms = searchParams.get('bathrooms') || 'all';
    const minArea = Number(searchParams.get('minArea')) || 0;
    const maxArea = Number(searchParams.get('maxArea')) || 0;
    const radiusKm = Number(searchParams.get('radiusKm')) || 10;
    const amenitiesParam = searchParams.get('amenities');
    const amenities = amenitiesParam ? (amenitiesParam.split(',') as any[]) : [];
    const status = (searchParams.get('status') as FilterState['status']) || 'all';
    const sortBy = (searchParams.get('sort') as FilterState['sortBy']) || 'newest';

    return {
      keyword: q,
      city,
      neighborhood,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      radiusKm,
      amenities,
      status,
      sortBy,
    };
  }, [searchParams]);

  const currentPage = Number(searchParams.get('page')) || 1;

  // Build RTK query params for searchListings
  const apiQueryParams: ListingSearchParams = useMemo(() => {
    const params: ListingSearchParams = {
      page: currentPage,
      limit: 12,
    };

    if (currentFilters.keyword) params.q = currentFilters.keyword;
    if (currentFilters.city && currentFilters.city !== 'All') params.city = currentFilters.city;
    if (currentFilters.neighborhood && currentFilters.neighborhood !== 'All Neighborhoods') {
      params.neighborhood = currentFilters.neighborhood;
    }
    if (currentFilters.propertyType) params.propertyType = currentFilters.propertyType;
    if (currentFilters.minPrice > 0) params.minPrice = currentFilters.minPrice;
    if (currentFilters.maxPrice > 0) params.maxPrice = currentFilters.maxPrice;

    if (currentFilters.bedrooms !== 'all') {
      if (currentFilters.bedrooms === '4+') {
        params.bedrooms_min = 4;
      } else {
        params.bedrooms = Number(currentFilters.bedrooms);
      }
    }

    if (currentFilters.bathrooms !== 'all') {
      params.bathrooms = Number(currentFilters.bathrooms.replace('+', ''));
    }

    if (currentFilters.minArea > 0) params.minArea = currentFilters.minArea;
    if (currentFilters.maxArea > 0) params.maxArea = currentFilters.maxArea;

    if (currentFilters.amenities && currentFilters.amenities.length > 0) {
      params.amenities = currentFilters.amenities.join(',');
    }

    if (currentFilters.status && currentFilters.status !== 'all') {
      params.status = currentFilters.status;
    }

    if (currentFilters.sortBy) {
      params.sort = currentFilters.sortBy;
    }

    return params;
  }, [currentFilters, currentPage]);

  const { data, isLoading, isFetching, isError, refetch } = useSearchListingsQuery(apiQueryParams);

  const listings = data?.data || data?.results || [];
  const meta = data?.meta;

  // Sync applied filters to URL
  const handleApplyFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.keyword) params.set('q', newFilters.keyword);
    if (newFilters.city && newFilters.city !== 'Addis Ababa') params.set('city', newFilters.city);
    if (newFilters.neighborhood) params.set('neighborhood', newFilters.neighborhood);
    if (newFilters.propertyType) params.set('propertyType', newFilters.propertyType);
    if (newFilters.minPrice > 0) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice > 0) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.bedrooms && newFilters.bedrooms !== 'all') params.set('bedrooms', newFilters.bedrooms);
    if (newFilters.bathrooms && newFilters.bathrooms !== 'all') params.set('bathrooms', newFilters.bathrooms);
    if (newFilters.minArea > 0) params.set('minArea', String(newFilters.minArea));
    if (newFilters.maxArea > 0) params.set('maxArea', String(newFilters.maxArea));
    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set('amenities', newFilters.amenities.join(','));
    }
    if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sort', newFilters.sortBy);

    // Reset to page 1 on filter update
    params.set('page', '1');

    router.push(`/listings?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/listings');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/listings?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  const activeFilterCount = [
    Boolean(currentFilters.neighborhood),
    Boolean(currentFilters.propertyType),
    currentFilters.minPrice > 0,
    currentFilters.maxPrice > 0,
    currentFilters.bedrooms !== 'all',
    currentFilters.bathrooms !== 'all',
    currentFilters.minArea > 0,
    currentFilters.maxArea > 0,
    currentFilters.amenities.length > 0,
    currentFilters.status !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] text-[#1e293b]">
      <Navbar favoritesCount={savedCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Search Header Bar */}
        <QuickSearchBar
          filters={currentFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          viewMode={viewMode === 'map' ? 'split' : viewMode}
          onViewModeChange={(mode) => dispatch(setViewMode(mode))}
          onOpenAdvancedFilters={() => dispatch(setFilterModalOpen(true))}
          activeFilterCount={activeFilterCount}
          totalListingsCount={meta?.total ?? listings.length}
        />

        {/* Error Banner */}
        {isError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <span>Unable to load rental listings right now. Please try again.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Layout: Grid vs Split Map */}
        <div className={`w-full ${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''}`}>
          {/* Listings Column */}
          <div className={viewMode === 'split' ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
            {isLoading || isFetching ? (
              /* Skeletons */
              <div
                className={`grid gap-5 ${
                  viewMode === 'split'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-stone-200/70 animate-pulse border border-stone-200"
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Empty State */
              <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-display">No properties found</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-6">
                  We couldn&apos;t find any rental properties matching your exact filters. Try broadening your price range or clearing some filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Listing Cards Grid */
              <div
                className={`grid gap-5 ${
                  viewMode === 'split'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    isFavorite={isSaved(listing._id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectListing={(l) => {
                      setSelectedListingId(l._id);
                      router.push(`/listings/${l.slug || l._id}`);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {meta && typeof meta.totalPages === 'number' && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-stone-600 px-3">
                  Page {currentPage} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Map Column (Split Mode) */}
          {viewMode === 'split' && (
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
                <MapboxView
                  listings={listings}
                  selectedListingId={selectedListingId}
                  onSelectListing={(l) => {
                    setSelectedListingId(l._id);
                    const el = document.getElementById(`listing-card-${l._id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  onNavigateToListing={(l) => {
                    setSelectedListingId(l._id);
                    router.push(`/listings/${l.slug || l._id}`);
                  }}
                  height="h-full"
                  showSearch={true}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Advanced Filter Modal */}
      <AdvancedFilterPanel
        isOpen={isFilterModalOpen}
        onClose={() => dispatch(setFilterModalOpen(false))}
        filters={currentFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <Footer />
    </div>
  );
}

export default function ListingsBrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ListingsBrowseContent />
    </Suspense>
  );
}
