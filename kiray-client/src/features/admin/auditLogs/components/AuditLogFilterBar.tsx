'use client';

import React from 'react';
import { Search, Filter, RotateCcw, Calendar, ArrowUpDown } from 'lucide-react';
import type { AuditLogListParams } from '@/types/admin';

interface AuditLogFilterBarProps {
  filters: AuditLogListParams;
  onFilterChange: (newFilters: AuditLogListParams) => void;
  onReset: () => void;
}

export const AuditLogFilterBar: React.FC<AuditLogFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const targetTypes = ['User', 'Listing', 'Comment', 'Report', 'System'];

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      action: e.target.value || undefined,
      page: 1,
    });
  };

  const handleTargetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      targetType: e.target.value ? (e.target.value as any) : undefined,
      page: 1,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
      page: 1,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
      page: 1,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sort: e.target.value as 'newest' | 'oldest',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    filters.action ||
      filters.targetType ||
      filters.startDate ||
      filters.endDate ||
      (filters.sort && filters.sort !== 'newest')
  );

  const startDateValue = filters.startDate ? filters.startDate.slice(0, 10) : '';
  const endDateValue = filters.endDate ? filters.endDate.slice(0, 10) : '';

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-2xs space-y-3"
      data-testid="audit-log-filter-bar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Action Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.action || ''}
            onChange={handleActionChange}
            placeholder="Search action (e.g. resolve, deactivate, update)..."
            className="w-full pl-8 pr-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white transition"
            data-testid="audit-filter-action"
          />
        </div>

        {/* Target Type Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filters.targetType || ''}
            onChange={handleTargetTypeChange}
            className="px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition cursor-pointer"
            data-testid="audit-filter-target-type"
          >
            <option value="">All Target Types</option>
            {targetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date Pickers */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-stone-50/70 border border-stone-200 rounded-xl px-2 py-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            <input
              type="date"
              value={startDateValue}
              onChange={handleStartDateChange}
              className="text-xs bg-transparent outline-none text-slate-800 cursor-pointer"
              title="Start Date"
              data-testid="audit-filter-start-date"
            />
          </div>
          <span className="text-stone-300 text-xs">—</span>
          <div className="flex items-center gap-1 bg-stone-50/70 border border-stone-200 rounded-xl px-2 py-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            <input
              type="date"
              value={endDateValue}
              onChange={handleEndDateChange}
              className="text-xs bg-transparent outline-none text-slate-800 cursor-pointer"
              title="End Date"
              data-testid="audit-filter-end-date"
            />
          </div>
        </div>

        {/* Sort Order Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filters.sort || 'newest'}
            onChange={handleSortChange}
            className="px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition cursor-pointer"
            data-testid="audit-filter-sort"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1 shrink-0"
            data-testid="audit-filter-reset-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
