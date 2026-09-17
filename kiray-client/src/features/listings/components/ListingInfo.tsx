'use client';

import React from 'react';
import type { Listing, Amenity } from '@/types/listing';
import { formatETB } from '@/lib/format';
import { AMENITY_LABELS } from '@/lib/constants';
import {
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Eye,
  Calendar,
  Sparkles,
  CheckCircle2,
  Building,
} from 'lucide-react';

export interface ListingInfoProps {
  listing: Listing;
}

export const ListingInfo: React.FC<ListingInfoProps> = ({ listing }) => {
  const neighborhood = listing.address?.neighborhood || listing.address?.city || 'Addis Ababa';
  const street = listing.address?.street;

  return (
    <div className="w-full space-y-6">
      {/* Title & Location Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>{neighborhood}</span>
          {street && <span className="text-stone-400 font-normal">· {street}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
          {listing.title}
        </h1>

        {/* Price & Status Banner */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div>
            <span className="text-xs text-stone-500 block">Monthly Rent</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {formatETB(listing.price)}
              </span>
              <span className="text-xs text-stone-500 font-medium">/ month</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                listing.status === 'open'
                  ? 'bg-emerald-100 text-emerald-800'
                  : listing.status === 'rented'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              ● {listing.status}
            </span>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Eye className="w-3.5 h-3.5" />
              <span>{listing.viewCount ?? 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Key Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-stone-200/80">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <BedDouble className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">Bedrooms</span>
            <span className="text-sm font-bold text-stone-800">{listing.bedrooms} Beds</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Bath className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">Bathrooms</span>
            <span className="text-sm font-bold text-stone-800">{listing.bathrooms} Baths</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">Area</span>
            <span className="text-sm font-bold text-stone-800">
              {listing.area ? `${listing.area} ${listing.areaUnit || 'sqm'}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">Type</span>
            <span className="text-sm font-bold text-stone-800 capitalize">{listing.propertyType}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-bold font-display text-stone-900 mb-2.5">
          About this home
        </h3>
        <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
          {listing.description || 'No description provided by the landlord.'}
        </div>
      </div>

      {/* Amenities & Features */}
      {listing.amenities && listing.amenities.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-display text-stone-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Amenities & Inclusions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {listing.amenities.map((amenity) => {
              const info = AMENITY_LABELS[amenity as Amenity];
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80 text-xs font-medium text-stone-800 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{info?.label || amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
