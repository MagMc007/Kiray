'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Save,
  Lock,
  UserCheck,
  Building,
} from 'lucide-react';
import {
  useGetConfigQuery,
  useUpdateConfigMutation,
} from '@/features/admin/system/adminSystemApi';
import { Skeleton } from '@/components/ui/Skeleton';

export const SystemConfigForm: React.FC = () => {
  const { data: config, isLoading, isError, error } = useGetConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateConfigMutation();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowNewSignups, setAllowNewSignups] = useState(true);
  const [maxListingsPerLandlord, setMaxListingsPerLandlord] = useState(50);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync state with fetched config
  useEffect(() => {
    if (config) {
      setMaintenanceMode(Boolean(config.maintenanceMode));
      setAllowNewSignups(Boolean(config.allowNewSignups));
      setMaxListingsPerLandlord(config.maxListingsPerLandlord ?? 50);
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4" data-testid="system-config-loading">
        <Skeleton className="h-6 w-52 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3" data-testid="system-config-error">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Failed to load platform configuration</span>
        </div>
        <p className="text-xs text-stone-500">
          {(error as any)?.data?.message || 'Unable to retrieve global system parameters.'}
        </p>
      </div>
    );
  }

  const isDirty =
    maintenanceMode !== config.maintenanceMode ||
    allowNewSignups !== config.allowNewSignups ||
    maxListingsPerLandlord !== config.maxListingsPerLandlord;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      await updateConfig({
        maintenanceMode,
        allowNewSignups,
        maxListingsPerLandlord: Number(maxListingsPerLandlord),
      }).unwrap();

      setFeedback({
        type: 'success',
        message: 'Platform configuration updated successfully.',
      });

      // Clear feedback after 4 seconds
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || err?.message || 'Failed to update system configuration.',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6" data-testid="system-config-panel">
      {/* Header */}
      <div className="border-b border-stone-100 pb-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-slate-900 text-base font-display">Global Platform Configuration</h3>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Manage system maintenance windows, user registration access, and landlord publishing quotas.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
          data-testid="config-feedback-alert"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Maintenance Mode Warning when enabled */}
      {maintenanceMode && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Maintenance Mode Active:</strong> Public visitors will see a service window notice. Administrative access remains active.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="system-config-form">
        {/* Maintenance Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50/80 rounded-xl border border-stone-200 gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-600" />
              <span>Maintenance Mode</span>
            </div>
            <div className="text-xs text-stone-500">
              Direct all non-admin traffic to the temporary maintenance window screen.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
              data-testid="maintenance-mode-toggle"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Allow New Signups Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50/80 rounded-xl border border-stone-200 gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-stone-600" />
              <span>Allow New Registrations</span>
            </div>
            <div className="text-xs text-stone-500">
              When disabled, new signups are temporarily blocked while existing users can sign in.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={allowNewSignups}
              onChange={(e) => setAllowNewSignups(e.target.checked)}
              className="sr-only peer"
              data-testid="allow-signups-toggle"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Max Listings Per Landlord */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50/80 rounded-xl border border-stone-200 gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-stone-600" />
              <span>Max Listings per Landlord</span>
            </div>
            <div className="text-xs text-stone-500">
              Global limit to prevent spam or unverified high-volume broker syndication.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1000}
              value={maxListingsPerLandlord}
              onChange={(e) => setMaxListingsPerLandlord(Number(e.target.value))}
              className="w-24 p-2 text-xs font-bold text-slate-900 bg-white border border-stone-300 rounded-xl text-center outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              data-testid="max-listings-input"
            />
            <span className="text-xs text-stone-500 font-semibold">properties</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={!isDirty || isUpdating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            data-testid="save-config-btn"
          >
            <Save className="w-4 h-4 text-stone-400" />
            <span>{isUpdating ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
