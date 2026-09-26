'use client';

import React, { useState } from 'react';
import {
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import { useGetDashboardQuery } from '@/features/admin/dashboard/adminDashboardApi';
import { useListAuditLogsQuery } from '@/features/admin/auditLogs/adminAuditApi';
import { AuditLogFilterBar } from '@/features/admin/auditLogs/components/AuditLogFilterBar';
import { AuditLogTable } from '@/features/admin/auditLogs/components/AuditLogTable';
import { AuditLogDetailDrawer } from '@/features/admin/auditLogs/components/AuditLogDetailDrawer';
import type { AuditLogListParams } from '@/types/admin';

export default function AdminAuditLogsPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: metrics } = useGetDashboardQuery();

  const [filters, setFilters] = useState<AuditLogListParams>({
    page: 1,
    limit: 20,
    sort: 'newest',
  });

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const {
    data: auditData,
    isLoading,
    isFetching,
    refetch,
  } = useListAuditLogsQuery(filters);

  const logs = auditData?.logs || [];
  const meta = auditData?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const totalPages = meta.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort: 'newest',
    });
  };

  return (
    <div className="space-y-8" data-testid="admin-audit-logs-page">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              System Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Immutable compliance event log, administrative overrides, and moderation actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white text-xs font-semibold border border-slate-800 transition cursor-pointer"
            title="Refresh audit logs"
            data-testid="refresh-audit-logs-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            Audit Active
          </span>
        </div>
      </div>

      {/* SHARED MODULE NAVIGATION */}
      <AdminHeaderNav />

      {/* FILTER CONTROLS */}
      <AuditLogFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* AUDIT LOG TABLE & METRICS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <span>Recorded System Events</span>
            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full font-mono text-[10px] font-bold">
              {meta.total} entries
            </span>
          </div>
          {isFetching && (
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Updating...</span>
            </span>
          )}
        </div>

        <AuditLogTable
          logs={logs}
          isLoading={isLoading}
          onSelectLog={(log) => setSelectedLogId(log._id)}
        />

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-stone-500">
              Page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> ({meta.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) <= 1 || isFetching}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                data-testid="audit-prev-page-btn"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) >= totalPages || isFetching}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                data-testid="audit-next-page-btn"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL INSPECTION DRAWER */}
      <AuditLogDetailDrawer
        isOpen={Boolean(selectedLogId)}
        onClose={() => setSelectedLogId(null)}
        logId={selectedLogId}
      />
    </div>
  );
}
