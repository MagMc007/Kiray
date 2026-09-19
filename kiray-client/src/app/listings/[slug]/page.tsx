'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingGallery } from '@/features/listings/components/ListingGallery';
import { ListingInfo } from '@/features/listings/components/ListingInfo';
import { OwnerProfileCard } from '@/features/listings/components/OwnerProfileCard';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { MapboxView } from '@/features/map/components/MapboxView';
import { useFavorites } from '@/features/favorites';
import { CommentList } from '@/features/comments';
import {
  useGetListingQuery,
  useGetSimilarListingsQuery,
  useTrackViewMutation,
  useTrackContactClickMutation,
} from '@/features/listings/listingsApi';
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  AlertTriangle,
  Home,
  Copy,
  Check,
} from 'lucide-react';

export interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

function ListingDetailPageContent({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slugOrId = resolvedParams?.slug || '';

  const { data: listing, isLoading, isError, error } = useGetListingQuery(slugOrId);
  const [trackView] = useTrackViewMutation();
  const [trackContactClick] = useTrackContactClickMutation();

  const { isSaved, toggleFavorite } = useFavorites();
  const isFavorite = listing ? isSaved(listing._id) : false;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleFavorite = () => {
    if (listing?._id) {
      toggleFavorite(listing._id);
    }
  };

  // Fetch similar listings once we have the listing _id
  const listingId = listing?._id || '';
  const { data: similarListings = [] } = useGetSimilarListingsQuery(listingId, {
    skip: !listingId,
  });

  // Fire-and-forget trackView on detail mount
  useEffect(() => {
    if (listing?._id) {
      trackView(listing._id).catch(() => {
        // Fire-and-forget: silently ignore errors
      });
    }
  }, [listing?._id, trackView]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator
          .share({
            title: listing?.title || 'Rental on Kiray',
            text: `Check out ${listing?.title} in ${listing?.address?.neighborhood || 'Addis Ababa'} on Kiray:`,
            url: window.location.href,
          })
          .catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9]">
        <Navbar />
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="h-6 w-48 bg-stone-200 rounded-md" />
          <div className="h-96 bg-stone-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-10 w-3/4 bg-stone-200 rounded-xl" />
              <div className="h-32 bg-stone-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 bg-stone-200 rounded-3xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">Listing Not Found</h2>
          <p className="text-sm text-stone-500 mb-6">
            The property you are looking for may have been rented, deleted, or the link is incorrect.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all listings</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const coordinates: [number, number] | undefined =
    listing.location?.coordinates && listing.location.coordinates.length === 2
      ? [listing.location.coordinates[0], listing.location.coordinates[1]]
      : undefined;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] text-[#1e293b]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation / Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/" className="hover:text-stone-800 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-stone-800">
              Listings
            </Link>
            <span>/</span>
            {listing.address?.neighborhood && (
              <>
                <Link
                  href={`/listings?neighborhood=${encodeURIComponent(listing.address.neighborhood)}`}
                  className="hover:text-stone-800"
                >
                  {listing.address.neighborhood}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-stone-800 font-medium truncate max-w-xs">{listing.title}</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="mb-8">
          <ListingGallery
            images={listing.images}
            title={listing.title}
            isVerified={listing.isVerified}
            isFeatured={listing.isFeatured}
            propertyType={listing.propertyType}
          />
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-8">
            <ListingInfo listing={listing} />

            {/* Neighborhood & Interactive Map */}
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold font-display text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Location & Neighborhood
              </h3>
              <p className="text-xs text-stone-500">
                {listing.address?.street ? `${listing.address.street}, ` : ''}
                {listing.address?.neighborhood || 'Bole'}, Addis Ababa
              </p>
              <div className="h-80 rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs">
                <MapboxView
                  listings={[listing]}
                  centerCoordinates={coordinates}
                  zoom={14}
                  height="h-full"
                  showCardOverlay={false}
                />
              </div>
            </div>

            {/* Renter Reviews & Feedback */}
            <CommentList
              listingId={listing._id}
              initialAverageRating={listing.averageRating}
              initialTotalReviews={listing.totalComments}
            />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <OwnerProfileCard
                owner={listing.ownerId}
                listingId={listing._id}
                onContactClick={() => {
                  if (listing._id) {
                    trackContactClick(listing._id);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <div className="pt-8 border-t border-stone-200/80 mb-12">
            <h3 className="text-xl font-bold font-display text-stone-900 mb-6">
              Similar properties you might like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarListings.slice(0, 3).map((similar) => (
                <ListingCard
                  key={similar._id}
                  listing={similar}
                  onSelectListing={(l) => router.push(`/listings/${l.slug || l._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ListingDetailPage(props: ListingDetailPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ListingDetailPageContent {...props} />
    </React.Suspense>
  );
}
