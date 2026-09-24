'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import type { Listing } from '@/types/listing';
import { MAP_DEFAULTS } from '@/lib/constants';
import { formatETB } from '@/lib/format';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface MapboxViewProps {
  listings?: Listing[];
  selectedListingId?: string | null;
  onSelectListing?: (listing: Listing) => void;
  onNavigateToListing?: (listing: Listing) => void;
  height?: string;
  centerCoordinates?: [number, number]; // [lng, lat]
  zoom?: number;
  interactivePicker?: boolean;
  onCoordinatesChange?: (coords: [number, number]) => void;
  showCardOverlay?: boolean;
  usePopupPreview?: boolean;
}

/**
 * Creates a rich, Airbnb-style DOM element for the Mapbox Popup.
 */
function createListingPopupElement(
  listing: Listing,
  onNavigate: () => void,
  onClose: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'relative w-64 sm:w-72 bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-200/90 font-sans cursor-pointer group text-left select-none animate-fade-in z-50';

  const imageUrl =
    listing.images && listing.images.length > 0 && listing.images[0]?.url
      ? listing.images[0].url
      : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80';

  const titleEscaped = (listing.title || 'Rental Property')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const neighborhood =
    listing.address?.neighborhood || listing.address?.city || 'Addis Ababa';
  const bedrooms = listing.bedrooms ?? 1;
  const bathrooms = listing.bathrooms ?? 1;
  const area = listing.area ? `${listing.area} ${listing.areaUnit || 'm²'}` : null;

  container.innerHTML = `
    <div class="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
      <img
        src="${imageUrl}"
        alt="${titleEscaped}"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25 pointer-events-none"></div>

      <!-- Dismiss Button -->
      <button
        type="button"
        data-action="close"
        aria-label="Close popup"
        class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center text-xs font-bold transition-all z-20 cursor-pointer shadow-md"
      >
        ✕
      </button>

      <!-- Property Type & Verified Badges -->
      <div class="absolute top-2 left-2 flex items-center gap-1.5 z-10">
        <span class="px-2 py-0.5 rounded-full bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
          ${listing.propertyType || 'Rental'}
        </span>
        ${
          listing.isVerified
            ? `<span class="px-2 py-0.5 rounded-full bg-sky-600/95 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs">
                ✓ Verified
              </span>`
            : ''
        }
      </div>

      <!-- Price overlay badge on image -->
      <div class="absolute bottom-2 left-2 right-2 flex items-baseline justify-between text-white z-10">
        <div class="flex items-baseline gap-1 bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs">
          <span class="text-sm font-extrabold tracking-tight text-white">
            ${formatETB(listing.price)}
          </span>
          <span class="text-[10px] font-medium text-stone-300">/mo</span>
        </div>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div>
        <h4 class="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          ${titleEscaped}
        </h4>
        <p class="text-[11px] text-stone-500 line-clamp-1 mt-0.5 flex items-center gap-1">
          <span>📍</span>
          <span>${neighborhood}, Addis Ababa</span>
        </p>
      </div>

      <!-- Specs Row -->
      <div class="flex items-center gap-3 pt-1 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
        <span class="flex items-center gap-1">🛏️ ${bedrooms} ${bedrooms === 1 ? 'bed' : 'beds'}</span>
        <span class="flex items-center gap-1">🚿 ${bathrooms} ${bathrooms === 1 ? 'bath' : 'baths'}</span>
        ${area ? `<span class="flex items-center gap-1">📐 ${area}</span>` : ''}
      </div>

      <!-- Full Width View Details Button -->
      <div class="pt-1">
        <button
          type="button"
          data-action="view-details"
          class="w-full py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <span class="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  `;

  // Attach event delegation
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-action="close"]')) {
      e.stopPropagation();
      e.preventDefault();
      onClose();
      return;
    }
    e.stopPropagation();
    onNavigate();
  });

  return container;
}

export const MapboxView: React.FC<MapboxViewProps> = ({
  listings = [],
  selectedListingId,
  onSelectListing,
  onNavigateToListing,
  height = 'h-full min-h-[480px]',
  centerCoordinates = MAP_DEFAULTS.ADDIS_COORDINATES,
  zoom = MAP_DEFAULTS.DEFAULT_ZOOM,
  interactivePicker = false,
  onCoordinatesChange,
  showCardOverlay = false,
  usePopupPreview = true,
}) => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const pickerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const activeListingIdRef = useRef<string | null>(null);
  activeListingIdRef.current = activeListing?._id || selectedListingId || null;

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'outdoors-v12' | 'satellite-v9'>('streets-v12');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Primary navigation handler
  const handleNavigate = useCallback(
    (listing: Listing) => {
      if (onNavigateToListing) {
        onNavigateToListing(listing);
      } else {
        router.push(`/listings/${listing.slug || listing._id}`);
      }
    },
    [onNavigateToListing, router]
  );

  // Close active popup helper
  const closeActivePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    setActiveListing(null);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: centerCoordinates,
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    mapRef.current = map;

    // Handle clicks on map canvas
    map.on('click', (e) => {
      if (interactivePicker && onCoordinatesChange) {
        const coords: [number, number] = [
          parseFloat(e.lngLat.lng.toFixed(4)),
          parseFloat(e.lngLat.lat.toFixed(4)),
        ];
        onCoordinatesChange(coords);

        if (!pickerMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'flex flex-col items-center cursor-pointer';
          el.innerHTML = `
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none" class="filter drop-shadow-md">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#ef4444"/>
              <circle cx="16" cy="15" r="5.5" fill="white"/>
            </svg>
            <div class="w-3.5 h-1 bg-black/35 rounded-full blur-[1px] -mt-0.5"></div>
          `;
          pickerMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .addTo(map);
        } else {
          pickerMarkerRef.current.setLngLat(coords);
        }
      } else {
        // Dismiss active popup when clicking anywhere outside pins
        closeActivePopup();
      }
    });

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [token, mapStyle, closeActivePopup, interactivePicker, onCoordinatesChange]);

  // Update center when centerCoordinates change
  useEffect(() => {
    if (mapRef.current && centerCoordinates) {
      mapRef.current.flyTo({ center: centerCoordinates, essential: true });
    }
  }, [centerCoordinates[0], centerCoordinates[1]]);

  // Manage Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter listings with valid coordinates
    const validListings = listings.filter(
      (l) =>
        l.location &&
        Array.isArray(l.location.coordinates) &&
        l.location.coordinates.length === 2 &&
        !isNaN(l.location.coordinates[0]) &&
        !isNaN(l.location.coordinates[1])
    );

    validListings.forEach((listing) => {
      const isSelected = listing._id === selectedListingId || listing._id === activeListing?._id;

      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'group flex flex-col items-center cursor-pointer outline-none select-none';

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <svg width="28" height="36" viewBox="0 0 32 42" fill="none" class="filter drop-shadow-md group-hover:drop-shadow-lg group-hover:brightness-110 transition-[filter] duration-150">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${isSelected ? '#047857' : '#059669'}"/>
            <circle cx="16" cy="15" r="6" fill="white"/>
            <circle cx="16" cy="15" r="3" fill="${isSelected ? '#047857' : '#059669'}"/>
          </svg>
          <div class="w-3.5 h-1 bg-black/25 rounded-full blur-[1px] -mt-0.5"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();

        // 1. If clicking a marker that already has an open popup, navigate directly
        if (activeListingIdRef.current === listing._id && popupRef.current) {
          handleNavigate(listing);
          return;
        }

        // 2. Smoothly fly camera to center this listing
        mapRef.current?.flyTo({
          center: [listing.location.coordinates[0], listing.location.coordinates[1]],
          zoom: Math.max(mapRef.current.getZoom(), 14.5),
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });

        // 3. Handle Rich Airbnb Popup
        if (usePopupPreview) {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          const popupNode = createListingPopupElement(
            listing,
            () => handleNavigate(listing),
            () => closeActivePopup()
          );

          const popup = new mapboxgl.Popup({
            offset: [0, -36],
            anchor: 'bottom',
            closeButton: false,
            closeOnClick: false,
            maxWidth: '280px',
            className: 'kiray-mapbox-popup',
          })
            .setLngLat([listing.location.coordinates[0], listing.location.coordinates[1]])
            .setDOMContent(popupNode)
            .addTo(mapRef.current!);

          popup.on('close', () => {
            popupRef.current = null;
            setActiveListing(null);
          });

          popupRef.current = popup;
        }

        setActiveListing(listing);

        if (onSelectListing) {
          onSelectListing(listing);
        }
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([listing.location.coordinates[0], listing.location.coordinates[1]])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [listings, selectedListingId, activeListing?._id, onSelectListing, handleNavigate, usePopupPreview, closeActivePopup]);

  // Fallback when token is not provided
  if (!token) {
    return (
      <div
        className={`relative w-full ${height} bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/80 p-6 flex flex-col items-center justify-center text-center`}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 shadow-xs">
          <MapPin className="w-7 h-7 stroke-[2]" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">Interactive Mapbox Map</h3>
        <p className="text-xs text-stone-500 max-w-sm mb-4">
          Mapbox GL JS is integrated. Add your public token to{' '}
          <code className="bg-stone-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-stone-700">
            .env.local
          </code>{' '}
          as <code className="text-emerald-700 font-semibold font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code>{' '}
          to display vector maps.
        </p>
        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-xs text-stone-600 border border-stone-200 shadow-xs">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Coordinates: {centerCoordinates[1].toFixed(4)}° N, {centerCoordinates[0].toFixed(4)}° E (Addis Ababa)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs flex flex-col`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Style Selector Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-stone-200/80 shadow-xs text-xs">
        <button
          type="button"
          onClick={() => setMapStyle('streets-v12')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            mapStyle === 'streets-v12' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Streets
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('outdoors-v12')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            mapStyle === 'outdoors-v12' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Outdoors
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('satellite-v9')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            mapStyle === 'satellite-v9' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Optional Fallback Selected Listing Floating Card (Only if popup preview is disabled) */}
      {!usePopupPreview && showCardOverlay && activeListing && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 bg-white/95 backdrop-blur-xs rounded-2xl p-3.5 border border-stone-200/90 shadow-xl animate-fade-in">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeListing.propertyType}
              </span>
              <h4 className="text-xs font-bold text-stone-900 mt-1 line-clamp-1">{activeListing.title}</h4>
              <p className="text-[11px] text-stone-500 line-clamp-1">
                {activeListing.address?.neighborhood || activeListing.address?.city}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveListing(null)}
              className="text-stone-400 hover:text-stone-700 p-1 text-xs cursor-pointer"
              aria-label="Close card preview"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-sm font-bold text-stone-900">
              {formatETB(activeListing.price)} <span className="text-[10px] text-stone-500 font-normal">/mo</span>
            </span>
            <Link
              href={`/listings/${activeListing.slug || activeListing._id}`}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
