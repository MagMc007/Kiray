'use client';

import React from 'react';
import {
  Server,
  Database,
  Activity,
  Cpu,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { useGetHealthQuery } from '@/features/admin/system/adminSystemApi';
import { Skeleton } from '@/components/ui/Skeleton';

function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

function bytesToMB(bytes: number): string {
  if (!bytes) return '0.0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SystemHealthPanel: React.FC = () => {
  const { data: health, isLoading, isError, error, refetch, isFetching } = useGetHealthQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6" data-testid="system-health-loading">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !health) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4" data-testid="system-health-error">
        <div className="flex items-center gap-2 text-rose-700 font-bold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Failed to load system health status</span>
        </div>
        <p className="text-xs text-stone-500">
          {(error as any)?.data?.message || 'The server health check endpoint could not be reached.'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  const isHealthy = health.status === 'healthy';
  const isDbConnected = health.database?.status === 'connected';
  const heapUsagePercent = health.memory?.heapTotal
    ? Math.min(100, Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100))
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6" data-testid="system-health-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base font-display">System Health & Telemetry</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isHealthy
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
              data-testid="health-status-badge"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {health.status}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time server infrastructure status, database connectivity, and Node.js process metrics.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          title="Refresh system metrics"
          data-testid="health-refresh-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-orange-600' : 'text-stone-500'}`} />
          <span>{isFetching ? 'Checking...' : 'Check Health'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database Health Card */}
        <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              MongoDB Cluster
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDbConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {health.database?.status || 'Unknown'}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate" title={health.database?.name}>
            Database: {health.database?.name || 'kiray'}
          </div>
          <div className="text-[11px] text-stone-500 font-mono truncate" title={health.database?.host}>
            Host: {health.database?.host || 'localhost'}
          </div>
        </div>

        {/* Uptime Card */}
        <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Server Uptime
            </span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-base font-extrabold text-slate-900 font-mono" data-testid="uptime-display">
            {formatUptime(health.uptime)}
          </div>
          <div className="text-[11px] text-stone-400">
            Last check: {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Memory Footprint Card */}
        <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-orange-600" />
              Process Memory
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-700">
              {heapUsagePercent}% Heap
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                heapUsagePercent > 85
                  ? 'bg-rose-500'
                  : heapUsagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${heapUsagePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1">
            <span>Used: {bytesToMB(health.memory?.heapUsed)}</span>
            <span>RSS: {bytesToMB(health.memory?.rss)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
