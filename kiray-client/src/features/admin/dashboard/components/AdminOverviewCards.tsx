'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Home,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { AdminDashboardMetrics } from '@/types/admin';

export interface AdminOverviewCardsProps {
  metrics?: AdminDashboardMetrics;
  isLoading?: boolean;
}

export const AdminOverviewCards: React.FC<AdminOverviewCardsProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid="admin-overview-skeletons"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-stone-100" />
            </div>
            <div className="h-8 w-16 bg-stone-200 rounded-lg" />
            <div className="h-3 w-32 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const users = metrics?.users || {
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    byRole: { landlord: 0, rentee: 0, admin: 0 },
  };

  const listings = metrics?.listings || {
    total: 0,
    active: 0,
    flagged: 0,
  };

  const pendingReports = metrics?.reports?.pending ?? 0;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      data-testid="admin-overview-cards"
    >
      {/* CARD 1: TOTAL USERS */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Community
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-extrabold text-slate-900">
                {users.total.toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                {users.active} active
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {users.byRole.landlord} Landlords · {users.byRole.rentee} Seekers
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
          <Link
            href="/admin/users"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-1.5 transition-all"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {(users.suspended > 0 || users.banned > 0) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              {users.suspended + users.banned} restricted
            </span>
          )}
        </div>
      </div>

      {/* CARD 2: ACTIVE LISTINGS */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Active Properties
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-extrabold text-slate-900">
                {listings.active.toLocaleString()}
              </p>
              <span className="text-xs font-medium text-stone-400">
                / {listings.total.toLocaleString()} total
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {listings.flagged > 0 ? (
                <span className="text-amber-600 font-semibold">
                  {listings.flagged} flagged for moderation
                </span>
              ) : (
                'All listings compliant'
              )}
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
          <Link
            href="/admin/listings"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group-hover:gap-1.5 transition-all"
          >
            <span>Moderate Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {listings.total > 0 ? Math.round((listings.active / listings.total) * 100) : 0}% active
          </span>
        </div>
      </div>

      {/* CARD 3: FLAGGED QUEUE */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Flagged Queue
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                pendingReports > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-3xl font-display font-extrabold ${
                  pendingReports > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {pendingReports}
              </p>
              <span className="text-xs text-stone-400">pending</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {pendingReports > 0
                ? 'Unresolved user & listing reports'
                : 'Moderation queue is all caught up'}
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
          <Link
            href="/admin/flagged"
            className={`text-xs font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all ${
              pendingReports > 0
                ? 'text-amber-600 hover:text-amber-700'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              pendingReports > 0
                ? 'bg-amber-100/80 text-amber-800'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {pendingReports > 0 ? 'Action Required' : 'All Clear'}
          </span>
        </div>
      </div>

      {/* CARD 4: PLATFORM GOVERNANCE & AUDIT */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Governance &amp; Audit
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-extrabold text-slate-900">Active</p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
            <p className="text-xs text-stone-500 mt-1">Audit logs &amp; system health monitor</p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
          <Link
            href="/admin/audit-logs"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group-hover:gap-1.5 transition-all"
          >
            <span>Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/system"
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
          >
            System Health
          </Link>
        </div>
      </div>
    </div>
  );
};
