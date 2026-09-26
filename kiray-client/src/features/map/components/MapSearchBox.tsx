'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
} from 'react';
import { Search, X, Loader2, MapPin } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
}

export interface MapSearchBoxProps {
  /** Mapbox public token — passed down from MapboxView */
  token: string;
  /** Called when the user selects a result */
  onSelect: (coords: [number, number], placeName: string) => void;
}

// ─── Addis Ababa geocoding constraints ───────────────────────────────────────

const ADDIS_PROXIMITY = '38.7469,9.0222';
// Tight bounding box: west, south, east, north
const ADDIS_BBOX = '38.60,8.85,38.95,9.18';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function placeTypeLabel(types: string[]): string {
  const map: Record<string, string> = {
    neighborhood: 'Neighborhood',
    locality: 'Locality',
    place: 'Place',
    poi: 'Point of Interest',
    address: 'Address',
    district: 'District',
  };
  for (const t of types) {
    if (map[t]) return map[t];
  }
  return 'Location';
}

function placeTypeIcon(types: string[]): string {
  if (types.includes('poi')) return '🏢';
  if (types.includes('address')) return '🏠';
  if (types.includes('neighborhood') || types.includes('locality')) return '📍';
  return '🗺️';
}

// ─── Component ───────────────────────────────────────────────────────────────

export const MapSearchBox: React.FC<MapSearchBoxProps> = ({ token, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Geocoding fetch ─────────────────────────────────────────────────────

  const fetchResults = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`
        );
        url.searchParams.set('access_token', token);
        url.searchParams.set('country', 'ET');
        url.searchParams.set('proximity', ADDIS_PROXIMITY);
        url.searchParams.set('bbox', ADDIS_BBOX);
        url.searchParams.set('types', 'place,neighborhood,locality,address,poi');
        url.searchParams.set('limit', '6');

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Geocoding request failed');
        const data = await res.json();
        const features: GeocodingFeature[] = data.features ?? [];
        setResults(features);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // ── Input change with debounce ──────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 300);
  };

  // ── Select a result ─────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (feature: GeocodingFeature) => {
      setQuery(feature.place_name.split(',')[0]);
      setIsOpen(false);
      setResults([]);
      onSelect(feature.center, feature.place_name);
      inputRef.current?.blur();
    },
    [onSelect]
  );

  // ── Clear ───────────────────────────────────────────────────────────────

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // ── Keyboard navigation ─────────────────────────────────────────────────

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // ── Scroll active item into view ────────────────────────────────────────

  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // ── Close on outside click ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Cleanup debounce on unmount ─────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-10 w-64 sm:w-72">
      {/* Input */}
      <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
        <span className="pl-3 text-stone-400 shrink-0">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search in Addis Ababa…"
          className="flex-1 px-2.5 py-2.5 text-[13px] text-stone-800 placeholder:text-stone-400 bg-transparent outline-none font-medium"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search location in Addis Ababa"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-3 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          ref={dropdownRef}
          role="listbox"
          className="mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {results.map((feature, idx) => {
            const isActive = idx === activeIndex;
            const [primaryName, ...rest] = feature.place_name.split(',');
            const secondaryName = rest.join(',').trim() || 'Addis Ababa';

            return (
              <li
                key={feature.id}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // mousedown fires before input blur, preserving the selection
                  e.preventDefault();
                  handleSelect(feature);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors ${
                  isActive ? 'bg-emerald-50' : 'hover:bg-stone-50'
                }`}
              >
                <span className="text-base shrink-0 mt-0.5 leading-none">
                  {placeTypeIcon(feature.place_type)}
                </span>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-stone-900 truncate leading-tight">
                    {primaryName}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5 leading-tight">
                    {secondaryName}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                    {placeTypeLabel(feature.place_type)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* No results state */}
      {isOpen && !isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div className="mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/80 px-4 py-3 flex items-center gap-2 text-stone-500 animate-in fade-in duration-150">
          <MapPin className="w-4 h-4 shrink-0 text-stone-400" />
          <p className="text-[12px]">No results found in Addis Ababa</p>
        </div>
      )}
    </div>
  );
};
