'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Listing } from '@/types/listing';
import { MAP_DEFAULTS } from '@/lib/constants';
import { formatETB } from '@/lib/format';
import { MapPin, Navigation, AlertCircle, Layers, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface MapboxViewProps {
  listings?: Listing[];
  selectedListingId?: string | null;
  onSelectListing?: (listing: Listing) => void;
  height?: string;
  centerCoordinates?: [number, number]; // [lng, lat]
  zoom?: number;
  interactivePicker?: boolean;
  onCoordinatesChange?: (coords: [number, number]) => void;
  showCardOverlay?: boolean;
}

export const MapboxView: React.FC<MapboxViewProps> = ({
  listings = [],
  selectedListingId,
  onSelectListing,
  height = 'h-full min-h-[480px]',
  centerCoordinates = MAP_DEFAULTS.ADDIS_COORDINATES,
  zoom = MAP_DEFAULTS.DEFAULT_ZOOM,
  interactivePicker = false,
  onCoordinatesChange,
  showCardOverlay = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const pickerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'outdoors-v12' | 'satellite-v9'>('streets-v12');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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

    if (interactivePicker && onCoordinatesChange) {
      map.on('click', (e) => {
        const coords: [number, number] = [
          parseFloat(e.lngLat.lng.toFixed(4)),
          parseFloat(e.lngLat.lat.toFixed(4)),
        ];
        onCoordinatesChange(coords);

        if (!pickerMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white';
          el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>';
          pickerMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map);
        } else {
          pickerMarkerRef.current.setLngLat(coords);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, mapStyle]);

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
      const isSelected = listing._id === selectedListingId;

      const el = document.createElement('button');
      el.type = 'button';
      el.className = `group flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-md transition-transform duration-200 cursor-pointer ${
        isSelected
          ? 'bg-stone-900 text-white ring-2 ring-emerald-500 scale-110 z-20'
          : 'bg-white text-stone-800 hover:bg-emerald-600 hover:text-white border border-stone-200 z-10'
      }`;
      el.innerHTML = `<span>${formatETB(listing.price)}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveListing(listing);
        if (onSelectListing) {
          onSelectListing(listing);
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.location.coordinates[0], listing.location.coordinates[1]])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [listings, selectedListingId, onSelectListing]);

  // Fallback when token is not provided
  if (!token) {
    return (
      <div
        className={`relative w-full ${height} bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/80 p-6 flex flex-col items-center justify-center text-center`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 shadow-xs">
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
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            mapStyle === 'streets-v12' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Streets
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('outdoors-v12')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            mapStyle === 'outdoors-v12' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Outdoors
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('satellite-v9')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            mapStyle === 'satellite-v9' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Selected Listing Floating Card */}
      {showCardOverlay && activeListing && (
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
              className="text-stone-400 hover:text-stone-700 p-1 text-xs"
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
