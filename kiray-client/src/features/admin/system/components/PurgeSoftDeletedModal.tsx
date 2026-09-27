'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  AlertTriangle,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { usePurgeSoftDeletedMutation } from '@/features/admin/system/adminSystemApi';
import type { PurgeSoftDeletedResult } from '@/types/system';

interface PurgeSoftDeletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: PurgeSoftDeletedResult) => void;
}

export const PurgeSoftDeletedModal: React.FC<PurgeSoftDeletedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [target, setTarget] = useState<'all' | 'listings' | 'users'>('all');
  const [daysOld, setDaysOld] = useState<number>(30);
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purgeResult, setPurgeResult] = useState<PurgeSoftDeletedResult | null>(null);

  const [purgeSoftDeleted, { isLoading }] = usePurgeSoftDeletedMutation();

  useEffect(() => {
    if (isOpen) {
      setTarget('all');
      setDaysOld(30);
      setConfirmText('');
      setErrorMsg(null);
      setPurgeResult(null);
    }
  }, [isOpen]);

  const isConfirmed = confirmText.trim() === 'PURGE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setErrorMsg(null);
    try {
      const result = await purgeSoftDeleted({
        daysOld: Number(daysOld),
        target,
      }).unwrap();

      setPurgeResult(result);
      onSuccess?.(result);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || err?.message || 'Failed to execute database purge.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanent Database Purge"
      description="Irreversible cleanup of soft-deleted records"
      maxWidth="md"
    >
      {purgeResult ? (
        <div className="space-y-4 text-center py-2" data-testid="purge-success-view">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base">Purge Completed</h4>
            <p className="text-xs text-stone-500">
              Soft-deleted database records older than {daysOld} days were permanently erased.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5 font-mono text-left">
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Purged Listings:</span>
              <span className="font-bold text-slate-900">{purgeResult.purgedListingsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Purged Users:</span>
              <span className="font-bold text-slate-900">{purgeResult.purgedUsersCount}</span>
            </div>
            {purgeResult.cutoffDate && (
              <div className="flex justify-between pt-1 border-t border-stone-200 text-[11px] text-stone-400">
                <span className="font-sans">Cutoff Date:</span>
                <span>{new Date(purgeResult.cutoffDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              data-testid="purge-close-btn"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="purge-modal-form">
          {/* Danger Warning Alert */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-rose-900">Irreversible Action:</strong>
              <p className="leading-relaxed">
                Purged documents will be <strong>permanently removed</strong> from the MongoDB database. They cannot be restored from the admin portal or landlord dashboards.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Purge Target Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Purge Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'all', label: 'All Records' },
                  { id: 'listings', label: 'Listings Only' },
                  { id: 'users', label: 'Users Only' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTarget(opt.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                    target === opt.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                  data-testid={`target-btn-${opt.id}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retention Threshold */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Age Threshold (Older Than)
            </label>
            <select
              value={daysOld}
              onChange={(e) => setDaysOld(Number(e.target.value))}
              className="w-full p-2.5 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              data-testid="days-old-select"
            >
              <option value={15}>15 days</option>
              <option value={30}>30 days (Recommended)</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
            </select>
          </div>

          {/* Strict Typed Confirmation */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-slate-800">
              Type <span className="font-mono text-rose-600 font-extrabold">PURGE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="PURGE"
              className="w-full p-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-rose-300 bg-rose-50/30 text-rose-950 placeholder:text-stone-300 outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              data-testid="purge-confirm-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
              data-testid="execute-purge-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Purging...' : 'Permanently Purge'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
