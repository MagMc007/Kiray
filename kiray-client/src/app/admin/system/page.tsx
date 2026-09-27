'use client';

import React, { useState } from 'react';
import {
  Server,
  Activity,
  Trash2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { AdminHeaderNav } from '@/features/admin/shared/components/AdminHeaderNav';
import { AdminLogoutButton } from '@/features/admin/shared/components/AdminLogoutButton';
import { SystemHealthPanel } from '@/features/admin/system/components/SystemHealthPanel';
import { SystemMaintenanceCard } from '@/features/admin/system/components/SystemMaintenanceCard';
import { useGetHealthQuery } from '@/features/admin/system/adminSystemApi';

type SystemTab = 'all' | 'health' | 'maintenance';

export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState<SystemTab>('all');
  const { refetch: refetchHealth, isFetching: isFetchingHealth } = useGetHealthQuery();

  const handleRefresh = () => {
    refetchHealth();
  };

  const isRefreshing = isFetchingHealth;

  const tabOptions: { id: SystemTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Modules', icon: Layers },
    { id: 'health', label: 'Health & Telemetry', icon: Activity },
    { id: 'maintenance', label: 'Database Purge', icon: Trash2 },
  ];

  return (
    <div className="space-y-8" data-testid="admin-system-page">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              System Health &amp; Maintenance
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Live infrastructure telemetry, process resource diagnostics, and database cleanup tools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white text-xs font-semibold border border-slate-800 transition cursor-pointer disabled:opacity-50"
            title="Refresh system telemetry"
            data-testid="refresh-system-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            Engine Online
          </span>
          <AdminLogoutButton />
        </div>
      </div>

      {/* SHARED MODULE NAVIGATION */}
      <AdminHeaderNav />

      {/* SUB-VIEW FOCUS PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold" data-testid="system-subtabs">
        <span className="text-stone-400 text-xs font-semibold px-1">View:</span>
        {tabOptions.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-slate-900 border border-stone-200/70'
              }`}
              data-testid={`system-tab-${tab.id}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SYSTEM MODULES */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'health') && (
          <SystemHealthPanel />
        )}

        {(activeTab === 'all' || activeTab === 'maintenance') && (
          <SystemMaintenanceCard />
        )}
      </div>
    </div>
  );
}

