'use client';

import React from 'react';
import { Shield, Users, Home, AlertTriangle, FileText } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function AdminDashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Welcome, {currentUser?.displayName || 'Administrator'} ({currentUser?.email})
            </p>
          </div>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
          Admin Role Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Total Users</span>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-display font-extrabold text-slate-900">--</p>
          <p className="text-[11px] text-stone-400">Connected in v0.8</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Listings</span>
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-display font-extrabold text-slate-900">--</p>
          <p className="text-[11px] text-stone-400">Connected in v0.8</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Flagged Queue</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-display font-extrabold text-slate-900">--</p>
          <p className="text-[11px] text-stone-400">Connected in v0.9</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">System Logs</span>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-display font-extrabold text-slate-900">--</p>
          <p className="text-[11px] text-stone-400">Connected in v0.9</p>
        </div>
      </div>
    </div>
  );
}
