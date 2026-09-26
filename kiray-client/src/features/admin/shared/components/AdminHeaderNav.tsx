'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  Building,
  AlertTriangle,
  History,
  Server,
  Layers,
} from 'lucide-react';
import { useGetDashboardQuery } from '@/features/admin/dashboard/adminDashboardApi';

interface AdminHeaderNavProps {
  userCount?: number;
  listingCount?: number;
  pendingReportsCount?: number;
}

export const AdminHeaderNav: React.FC<AdminHeaderNavProps> = ({
  userCount,
  listingCount,
  pendingReportsCount,
}) => {
  const pathname = usePathname();
  const { data: metrics } = useGetDashboardQuery(undefined, {
    // Only fetch if props are not explicitly provided
    skip: userCount !== undefined && listingCount !== undefined,
  });

  const totalUsers = userCount ?? metrics?.users?.total;
  const totalListings = listingCount ?? metrics?.listings?.total;
  const totalPendingReports = pendingReportsCount ?? metrics?.reports?.pending;

  const primaryTabs = [
    {
      href: '/admin',
      label: 'Overview & Charts',
      icon: BarChart3,
      exact: true,
    },
    {
      href: '/admin/users',
      label: 'Member Directory',
      icon: Users,
      count: totalUsers,
      exact: false,
    },
    {
      href: '/admin/listings',
      label: 'Listing Inventory',
      icon: Building,
      count: totalListings,
      exact: false,
    },
  ];

  const governanceTabs = [
    {
      href: '/admin/flagged',
      label: 'Flagged Queue',
      icon: AlertTriangle,
      badge: totalPendingReports,
      badgeColor: 'bg-rose-500 text-white',
      exact: false,
    },
    {
      href: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: History,
      exact: false,
    },
    {
      href: '/admin/system',
      label: 'System Health',
      icon: Server,
      exact: false,
    },
  ];

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200/80 p-2 sm:p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3"
      data-testid="admin-header-nav"
    >
      {/* Left: Primary Management & Analytics Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold py-0.5 max-w-full">
        <span className="text-stone-400 flex items-center gap-1 px-2 shrink-0">
          <Layers className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Module:</span>
        </span>

        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

          const testIdSlug = tab.href === '/admin' ? 'overview' : tab.href.replace(/^\/admin\//, '');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-testid={`admin-nav-${testIdSlug}`}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-50/80 text-stone-600 hover:bg-stone-100 hover:text-slate-900 border border-stone-200/60'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-orange-400' : 'text-stone-400'
                }`}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-slate-800 text-stone-300'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: Standalone Governance & Audit Modules */}
      <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto text-xs font-bold">
        <span className="text-stone-400 hidden lg:inline-block text-[11px] font-semibold mr-1 uppercase tracking-wider">
          Governance:
        </span>

        {governanceTabs.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`admin-nav-${item.href.replace('/admin/', '')}`}
              className={`px-3 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-50/80 text-stone-600 hover:bg-stone-100 hover:text-slate-900 border border-stone-200/60'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-white' : 'text-stone-400'
                }`}
              />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
