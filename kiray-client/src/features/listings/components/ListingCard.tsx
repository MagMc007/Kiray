'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/features/favorites';
import { useIsAuthenticated } from '@/features/auth/useIsAuthenticated';
import type { Listing } from '@/types/listing';
import type { User } from '@/types/user';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  Heart,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelectListing?: (listing: Listing) => void;
  onContactClick?: (listing: Listing, method: 'call' | 'whatsapp') => void;
  isAuthenticated?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onSelectListing,
  onContactClick,
  isAuthenticated: isAuthenticatedProp,
}) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated(isAuthenticatedProp);
  const { isSaved, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const effectiveIsFavorite =
    isFavorite !== undefined ? isFavorite : isSaved(listing._id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(listing._id);
    } else {
      toggleFavorite(listing._id);
    }
  };

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', publicId: 'default', order: 0 }];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleCardClick = () => {
    const targetUrl = `/listings/${listing.slug || listing._id}`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}&reason=details`);
      return;
    }
    if (onSelectListing) {
      onSelectListing(listing);
    } else {
      router.push(targetUrl);
    }
  };

  // Resolve owner details whether ownerId is populated as User or an ID string
  const ownerUser: Partial<User> | null =
    typeof listing.ownerId === 'object' && listing.ownerId !== null
      ? (listing.ownerId as User)
      : null;

  const ownerDisplayName =
    ownerUser?.displayName || ownerUser?.fullName || 'Property Owner';
  const ownerPhoto = ownerUser?.photoURL;
  const ownerPhone = ownerUser?.phone || ownerUser?.phoneNumber?.[0];
  const ownerWhatsapp = ownerUser?.whatsapp || (ownerPhone ? ownerPhone.replace(/\D/g, '') : undefined);
  const isOwnerVerified = Boolean(listing.isVerified || ownerUser?.isVerified);

  const neighborhood =
    listing.address?.neighborhood || listing.address?.city || 'Addis Ababa';
  const propertyType = listing.propertyType || 'apartment';

  return (
    <div
      id={`listing-card-${listing._id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
    >
      {/* Photo carousel / thumbnail */}
      <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
        <img
          src={images[currentImageIndex]?.url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Save Listing Button */}
        <button
          id={`fav-btn-${listing._id}`}
          aria-label={effectiveIsFavorite ? 'Remove from saved' : 'Save listing'}
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-xs transition-all transform active:scale-95 z-10 flex items-center gap-1.5 cursor-pointer ${
            effectiveIsFavorite
              ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-300'
              : 'bg-white/95 text-slate-800 hover:bg-white hover:text-rose-600'
          }`}
          title={effectiveIsFavorite ? 'Remove from saved' : 'Save listing'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition ${
              effectiveIsFavorite ? 'fill-white text-white' : 'text-rose-500'
            }`}
          />
          <span className="text-[11px]">{effectiveIsFavorite ? 'Saved' : 'Save'}</span>
        </button>

        {/* Status / Neighborhood Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold tracking-wide uppercase">
            {propertyType}
          </span>
          {isOwnerVerified && (
            <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Owner
            </span>
          )}
        </div>

        {/* Multi-image indicators and navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition z-10 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition z-10 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? 'w-4 bg-orange-500'
                      : 'w-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom Price in Image */}
        <div className="absolute bottom-3 left-3 text-white z-10">
          <span className="font-extrabold text-lg sm:text-xl drop-shadow-md">
            ETB {listing.price.toLocaleString()}
          </span>
          <span className="text-xs text-stone-200 font-medium ml-1">/mo</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-orange-600 transition line-clamp-1">
              {listing.title}
            </h3>
            {listing.averageRating > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{listing.averageRating.toFixed(1)}</span>
                {listing.totalComments > 0 && (
                  <span className="text-[10px] text-stone-400 font-normal">
                    ({listing.totalComments})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Location text */}
          <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{listing.address?.street || neighborhood}</span>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 mt-2 border-y border-stone-100 text-xs text-stone-600 font-medium">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{listing.area ? `${listing.area} m²` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Owner Info & Direct Contact Actions */}
        <div className="mt-3 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar
              name={ownerDisplayName}
              photoURL={ownerPhoto}
              size="xs"
              ring="ring-1 ring-stone-200"
            />
            <div className="leading-tight">
              <span className="block text-xs font-bold text-slate-800 truncate max-w-[100px]">
                {ownerDisplayName}
              </span>
              <span className="block text-[10px] text-stone-500">
                Direct Landlord
              </span>
            </div>
          </div>

          {/* Direct Contact Buttons */}
          <div className="flex items-center gap-1.5">
            {ownerWhatsapp && (
              <button
                id={`card-wa-btn-${listing._id}`}
                aria-label="Message owner on WhatsApp"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    const targetUrl = `/listings/${listing.slug || listing._id}`;
                    router.push(
                      `/login?redirect=${encodeURIComponent(targetUrl)}&reason=contact`
                    );
                    return;
                  }
                  if (onContactClick) {
                    onContactClick(listing, 'whatsapp');
                  } else {
                    window.open(`https://wa.me/${ownerWhatsapp}`, '_blank');
                  }
                }}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                title={
                  isAuthenticated
                    ? 'Message owner directly on WhatsApp'
                    : 'Sign in to message owner on WhatsApp'
                }
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}

            {ownerPhone && (
              <button
                id={`card-call-btn-${listing._id}`}
                aria-label="Call landlord directly"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    const targetUrl = `/listings/${listing.slug || listing._id}`;
                    router.push(
                      `/login?redirect=${encodeURIComponent(targetUrl)}&reason=contact`
                    );
                    return;
                  }
                  if (onContactClick) {
                    onContactClick(listing, 'call');
                  } else {
                    window.location.href = `tel:${ownerPhone}`;
                  }
                }}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition cursor-pointer"
                title={
                  isAuthenticated
                    ? 'Call landlord directly (zero commission)'
                    : 'Sign in to call landlord directly'
                }
              >
                <Phone className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-3 py-1.5 bg-stone-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
