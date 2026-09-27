'use client';

import React, { useState } from 'react';
import { Database, Trash2, ShieldAlert, Sparkles, HardDrive } from 'lucide-react';
import { PurgeSoftDeletedModal } from './PurgeSoftDeletedModal';
import type { PurgeSoftDeletedResult } from '@/types/system';

export const SystemMaintenanceCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastPurgeSummary, setLastPurgeSummary] = useState<string | null>(null);

  const handleSuccess = (result: PurgeSoftDeletedResult) => {
    setLastPurgeSummary(
      `Last purge executed: ${result.purgedListingsCount} listings and ${result.purgedUsersCount} users permanently removed.`
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5" data-testid="system-maintenance-card">
        {/* Header */}
        <div className="border-b border-stone-100 pb-5">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base font-display">Database Maintenance & Purge</h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Reclaim storage and enforce data privacy policies by permanently deleting expired soft-deleted entities.
          </p>
        </div>

        {lastPurgeSummary && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium" data-testid="purge-summary-banner">
            {lastPurgeSummary}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200 gap-4">
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs sm:text-sm">
              Purge Soft-Deleted Records
            </div>
            <div className="text-xs text-stone-500 max-w-md leading-relaxed">
              When users delete listings or accounts, records are soft-deleted for 30 days. Run cleanup to permanently remove them from the database.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            data-testid="open-purge-modal-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Launch Purge Tool</span>
          </button>
        </div>
      </div>

      <PurgeSoftDeletedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};
