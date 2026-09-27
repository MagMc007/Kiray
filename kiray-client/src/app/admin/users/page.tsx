'use client';

import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import { AdminLogoutButton } from '@/features/admin/shared/components/AdminLogoutButton';
import { UserTable } from '@/features/admin/users/components/UserTable';
import { useGetDashboardQuery } from '@/features/admin/dashboard/adminDashboardApi';

export default function AdminUsersPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: metrics, refetch } = useGetDashboardQuery();

  return (
    <div className="space-y-8" data-testid="admin-users-page">
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
          <AdminLogoutButton />
        </div>
      </div>

      {/* SHARED MODULE NAVIGATION */}
      <AdminHeaderNav userCount={metrics?.users?.total} />

      {/* USER MANAGEMENT MODULE */}
      <div className="pt-2">
        <UserTable />
      </div>
    </div>
  );
}
