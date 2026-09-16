'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  PlusCircle,
  ShieldCheck,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Heart,
  BedDouble,
  Bath,
  Maximize2,
} from 'lucide-react';
import type { Listing } from '@/types/listing';

export interface HeroSectionProps {
  onBrowse?: () => void;
  onListProperty?: () => void;
  onExploreMap?: () => void;
  featuredListing?: Listing;
  onSelectListing?: (listing: Listing) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowse,
  onListProperty,
  onExploreMap,
  featuredListing,
  onSelectListing,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const router = useRouter();

  const handleBrowse = () => {
    if (onBrowse) onBrowse();
    else router.push('/listings');
  };

  const handleListProperty = () => {
    if (onListProperty) onListProperty();
    else router.push('/register?role=landlord');
  };

  const handleExploreMap = () => {
    if (onExploreMap) onExploreMap();
    else router.push('/listings?view=map');
  };

  const handleSelectFeatured = () => {
    if (featuredListing) {
      if (onSelectListing) onSelectListing(featuredListing);
      else router.push(`/listings/${featuredListing.slug || featuredListing._id}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-6 sm:pb-8 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy, CTAs, and Trust Badges */}
          <div className="lg:col-span-6 space-y-8 z-10 text-left">
            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.08]">
                Your journey to a new home,
                <br />
                <span className="text-orange-600">made simple.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed font-normal">
              Kiray connects renters with verified property owners directly across Addis Ababa.
              Transparent. Local. 100% Commission-free.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                id="hero-browse-btn"
                onClick={handleBrowse}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
                <span>Browse Properties</span>
              </button>

              <button
                id="hero-list-property-btn"
                onClick={handleListProperty}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-50 active:bg-stone-100 text-slate-800 font-bold text-base rounded-2xl border border-stone-300 shadow-xs hover:border-stone-400 transition cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-orange-600" />
                <span>List Your Property</span>
              </button>
            </div>

            {/* Three Trust Badges below buttons */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-200/80">
              {/* Badge 1 */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 text-orange-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">No Commissions</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Deal directly</p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 text-orange-700 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Direct Contact</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">WhatsApp &amp; phone</p>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 text-orange-700 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Safe &amp; Verified</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">GPS &amp; reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with curved mask & floating cards */}
          <div className="lg:col-span-6 relative">
            {/* Living Room photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-[16/11] max-h-[520px] w-full border border-stone-200/80 bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
                alt="Sunlit modern living room overlooking Addis Ababa"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>
            {/* Floating Property Card (Bottom Left / Bottom Right) */}
            <div
              id="hero-floating-property-card"
              onClick={handleSelectFeatured}
              className="absolute -bottom-6 -left-2 sm:left-4 sm:right-auto w-[94%] sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-stone-200/90 cursor-pointer hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 z-20 group"
            >
              <div className="flex gap-3 items-center">
                {/* Thumbnail */}
                <div className="relative w-20 h-18 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                  <img
                    src={
                      featuredListing?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={featuredListing?.title || 'Modern 2 Bedroom Apartment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {featuredListing?.title || 'Modern 2 Bedroom Apartment'}
                    </h4>
                    {onToggleFavorite && featuredListing && (
                      <button
                        aria-label="Save featured listing"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(featuredListing._id);
                        }}
                        className="text-stone-400 hover:text-rose-500 p-0.5 ml-1 cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Neighborhood */}
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {featuredListing?.address?.neighborhood || 'Bole Medhanialem'}, Addis Ababa
                  </p>

                  {/* Specs Icons */}
                  <div className="flex items-center gap-2.5 text-[10px] text-stone-600 mt-1 font-medium">
                    <span className="flex items-center gap-0.5">
                      <BedDouble className="w-3 h-3 text-stone-400" />
                      {featuredListing?.bedrooms || 2} Beds
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Bath className="w-3 h-3 text-stone-400" />
                      {featuredListing?.bathrooms || 2} Baths
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Maximize2 className="w-3 h-3 text-stone-400" />
                      {featuredListing?.area || 90} m²
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-extrabold text-orange-600 text-xs sm:text-sm">
                      ETB {(featuredListing?.price || 22000).toLocaleString()}{' '}
                      <span className="text-[10px] text-stone-400 font-normal">/mo</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
