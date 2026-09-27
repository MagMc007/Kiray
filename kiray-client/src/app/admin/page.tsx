'use client';

import React from 'react';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetDashboardQuery } from '@/features/admin/dashboard/adminDashboardApi';
import { useSearchListingsQuery } from '@/features/listings/listingsApi';
import { AdminOverviewCards } from '@/features/admin/dashboard/components/AdminOverviewCards';
import { AdminAnalytics } from '@/features/admin/dashboard/components/AdminAnalytics';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import { AdminLogoutButton } from '@/features/admin/shared/components/AdminLogoutButton';

export default function AdminDashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    refetch,
  } = useGetDashboardQuery();

  const { data: listingsData } = useSearchListingsQuery({ limit: 50 });

  return (
    <div className="space-y-8" data-testid="admin-dashboard-page">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Welcome, {currentUser?.displayName || 'Administrator'} ({currentUser?.email || 'admin@kiray.et'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white text-xs font-semibold border border-slate-800 transition cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            Admin Role Verified
          </span>
          <AdminLogoutButton />
        </div>
      </div>

      {/* ERROR ALERT */}
      {isMetricsError && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4"
          data-testid="metrics-error-banner"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm">
              Failed to load administrative overview metrics. You can retry the request.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* LIVE OVERVIEW METRICS CARDS */}
      <AdminOverviewCards metrics={metrics} isLoading={isMetricsLoading} />

      {/* SHARED MODULE NAVIGATION */}
      <AdminHeaderNav />

      {/* PLATFORM ANALYTICS SECTION */}
      <div className="space-y-4">
        <div className="border-t border-stone-200 pt-6">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Platform Analytics &amp; Performance
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            System performance insights, supply and demand metrics, and community trends
          </p>
        </div>

        <AdminAnalytics
          propertyTypes={metrics?.listings?.byPropertyType}
          listings={listingsData?.results}
        />
      </div>
    </div>
  );
}

