'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Sparkles,
  DollarSign,
  Maximize2,
  Building,
  BedDouble,
  Bath,
  ArrowDownUp,
} from 'lucide-react';
import { PROPERTY_TYPES, AMENITIES, AMENITY_LABELS } from '@/lib/constants';
import { formatETB } from '@/lib/format';
import type { FilterState, Amenity } from '@/types/listing';
import { initialFilterState } from '../listingsSlice';
import { useTranslation } from '@/i18n';

export interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleAmenityToggle = (amenity: Amenity) => {
    const exists = draft.amenities.includes(amenity);
    const updated = exists
      ? draft.amenities.filter((a) => a !== amenity)
      : [...draft.amenities, amenity];
    setDraft({ ...draft, amenities: updated });
  };

  const handleResetDraft = () => {
    setDraft(initialFilterState);
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const bedroomOptions = [
    { label: t.browseListings.anyBeds, value: 'all' },
    { label: t.browseListings.oneBed, value: '1' },
    { label: t.browseListings.twoBeds, value: '2' },
    { label: t.browseListings.threeBeds, value: '3' },
    { label: t.browseListings.fourPlusBeds, value: '4+' },
  ];

  const bathroomOptions = [
    { label: t.browseListings.anyBaths, value: 'all' },
    { label: t.browseListings.oneBath, value: '1' },
    { label: t.browseListings.twoBaths, value: '2' },
    { label: t.browseListings.threePlusBaths, value: '3+' },
  ];

  const sortOptions = [
    { label: t.browseListings.sortNewest, value: 'newest' },
    { label: t.browseListings.sortPriceAsc, value: 'price_asc' },
    { label: t.browseListings.sortPriceDesc, value: 'price_desc' },
    { label: t.browseListings.sortPopular, value: 'popular' },
    { label: t.browseListings.sortOldest, value: 'oldest' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-filter-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div>
            <h2 id="advanced-filter-title" className="text-xl font-bold font-display text-stone-900">
              {t.browseListings.filterPropertiesTitle}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {t.browseListings.filterPropertiesSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.browseListings.cancel}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {t.browseListings.monthlyRentTitle}
              </label>
              </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-xs text-stone-400 mb-1 block">{t.browseListings.minPriceLabel}</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={draft.minPrice || ''}
                  onChange={(e) => setDraft({ ...draft, minPrice: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-xs text-stone-400 mb-1 block">{t.browseListings.maxPriceLabel}</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={draft.maxPrice || ''}
                  onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value) || 0 })}
                  placeholder={t.browseListings.anyPlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              {t.browseListings.bedroomsTitle}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {bedroomOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, bedrooms: opt.value })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    draft.bedrooms === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <Bath className="w-4 h-4 text-emerald-600" />
              {t.browseListings.bathroomsTitle}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {bathroomOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, bathrooms: opt.value })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    draft.bathrooms === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <Building className="w-4 h-4 text-emerald-600" />
              {t.browseListings.propertyTypeTitle}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, propertyType: '' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  draft.propertyType === ''
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                }`}
              >
                {t.browseListings.allTypes}
              </button>
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, propertyType: pt.value })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    draft.propertyType === pt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                  }`}
                >
                  {t.propertyTypes[pt.value as keyof typeof t.propertyTypes] || pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Range */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              {t.browseListings.floorAreaTitle}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-stone-400 mb-1 block">{t.browseListings.minAreaLabel}</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.minArea || ''}
                  onChange={(e) => setDraft({ ...draft, minArea: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-xs text-stone-400 mb-1 block">{t.browseListings.maxAreaLabel}</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.maxArea || ''}
                  onChange={(e) => setDraft({ ...draft, maxArea: Number(e.target.value) || 0 })}
                  placeholder={t.browseListings.anyPlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.browseListings.amenitiesTitle}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map((amenity) => {
                const isSelected = draft.amenities.includes(amenity);
                const info = AMENITY_LABELS[amenity];
                const labelText =
                  t.amenityLabels[amenity as keyof typeof t.amenityLabels] || info?.label || amenity;
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 font-medium'
                        : 'bg-stone-50/70 border-stone-200/60 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] transition-colors ${
                        isSelected ? 'bg-emerald-600 text-white' : 'border border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="font-semibold text-stone-900 flex items-center gap-1.5 mb-2.5">
              <ArrowDownUp className="w-4 h-4 text-emerald-600" />
              {t.browseListings.sortOrderTitle}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      sortBy: opt.value as FilterState['sortBy'],
                    })
                  }
                  className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition-all ${
                    draft.sortBy === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDraft}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-rose-600 py-2 px-3 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.browseListings.resetAll}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              {t.browseListings.cancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t.browseListings.applyFilters}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
