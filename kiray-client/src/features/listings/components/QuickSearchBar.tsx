'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Building,
  SlidersHorizontal,
  Map,
  Grid,
  RotateCcw,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { PROPERTY_TYPES } from '@/lib/constants';
import type { FilterState } from '@/types/listing';

export interface QuickSearchBarProps {
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  viewMode: 'split' | 'grid';
  onViewModeChange: (mode: 'split' | 'grid') => void;
  onOpenAdvancedFilters?: () => void;
  activeFilterCount?: number;
  totalListingsCount?: number;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onOpenAdvancedFilters,
  activeFilterCount = 0,
  totalListingsCount,
}) => {
  const [draftKeyword, setDraftKeyword] = useState<string>(filters.keyword || '');
  const [draftMinPrice, setDraftMinPrice] = useState<number>(filters.minPrice || 0);
  const [draftMaxPrice, setDraftMaxPrice] = useState<number>(filters.maxPrice || 0);
  const [draftType, setDraftType] = useState<string>(filters.propertyType || '');

  useEffect(() => {
    setDraftKeyword(filters.keyword || '');
    setDraftMinPrice(filters.minPrice || 0);
    setDraftMaxPrice(filters.maxPrice || 0);
    setDraftType(filters.propertyType || '');
  }, [
    filters.keyword,
    filters.minPrice,
    filters.maxPrice,
    filters.propertyType,
  ]);

  const hasPendingChanges =
    draftKeyword !== (filters.keyword || '') ||
    draftMinPrice !== (filters.minPrice || 0) ||
    draftMaxPrice !== (filters.maxPrice || 0) ||
    draftType !== (filters.propertyType || '');

  const isAnyFilterActive =
    Boolean(filters.keyword) ||
    Boolean(filters.propertyType) ||
    filters.minPrice > 0 ||
    (filters.maxPrice > 0 && filters.maxPrice < 500000) ||
    activeFilterCount > 0;

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      keyword: draftKeyword,
      propertyType: draftType,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-stone-200/80 p-3.5 sm:p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Keyword Search */}
        <div className="lg:col-span-4 relative">
          <label htmlFor="quick-search-input" className="sr-only">
            Search keywords or title
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="quick-search-input"
            type="text"
            value={draftKeyword}
            onChange={(e) => setDraftKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search keywords, street, features..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-800 placeholder-stone-400 rounded-xl text-sm border border-stone-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Monthly Rent Range */}
        <div className="lg:col-span-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-stone-400 shrink-0" />
          <label htmlFor="quick-min-price" className="sr-only">Min rent (ETB)</label>
          <input
            id="quick-min-price"
            type="number"
            min={0}
            step={1000}
            value={draftMinPrice || ''}
            onChange={(e) => setDraftMinPrice(Number(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            placeholder="Min ETB"
            className="w-1/2 pl-2 pr-2 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-800 placeholder-stone-400 rounded-xl text-sm border border-stone-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
          <span className="text-stone-300 text-sm shrink-0">–</span>
          <label htmlFor="quick-max-price" className="sr-only">Max rent (ETB)</label>
          <input
            id="quick-max-price"
            type="number"
            min={0}
            step={1000}
            value={draftMaxPrice || ''}
            onChange={(e) => setDraftMaxPrice(Number(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            placeholder="Max ETB"
            className="w-1/2 pl-2 pr-2 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-800 placeholder-stone-400 rounded-xl text-sm border border-stone-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Property Type Select */}
        <div className="lg:col-span-3 relative">
          <label htmlFor="quick-property-type-select" className="sr-only">
            Select Property Type
          </label>
          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <select
            id="quick-property-type-select"
            value={draftType}
            onChange={(e) => setDraftType(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-800 rounded-xl text-sm border border-stone-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-colors"
          >
            <option value="">All Property Types</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
            ▼
          </div>
        </div>

        {/* Action Controls */}
        <div className="lg:col-span-2 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleApply}
            aria-label="Apply search filters"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          {onOpenAdvancedFilters && (
            <button
              type="button"
              onClick={onOpenAdvancedFilters}
              aria-label="Open advanced filters"
              className="relative p-2.5 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-300 text-stone-700 rounded-xl transition-colors cursor-pointer"
              title="Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Reset filters"
              className="p-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-500 rounded-xl transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: Status and View Toggle */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          {totalListingsCount !== undefined && (
            <span className="font-medium text-stone-700">
              <span className="font-bold text-emerald-600">{totalListingsCount}</span> properties available
            </span>
          )}
          {hasPendingChanges && (
            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
              <Sparkles className="w-3 h-3" /> Press Search to update
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Split</span>
          </button>
        </div>
      </div>
    </div>
  );
};
