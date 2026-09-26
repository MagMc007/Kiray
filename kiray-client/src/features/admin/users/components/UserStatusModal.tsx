'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import { useUpdateUserStatusMutation } from '@/features/admin/users/adminUserApi';
import type { User, UserStatus } from '@/types/user';

interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [status, setStatus] = useState<UserStatus>('active');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [updateStatus, { isLoading, error }] = useUpdateUserStatusMutation();

  useEffect(() => {
    if (user) {
      setStatus(user.status || 'active');
      setReason('');
      setFormError(null);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if ((status === 'suspended' || status === 'banned') && !reason.trim()) {
      setFormError(`A reason is required when placing an account in ${status} status.`);
      return;
    }

    try {
      await updateStatus({
        id: user._id,
        status,
        reason: reason.trim() || undefined,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to update user status.');
    }
  };

  const getStatusIcon = (st: UserStatus) => {
    switch (st) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'suspended':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'banned':
        return <Ban className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Account Status"
      description={`Manage platform access and moderation standing for ${user.displayName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="user-status-modal-form">
        {/* Error Feedback */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="status-form-error"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* User Identity Preview */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900 text-sm">{user.displayName}</div>
            <div className="text-xs text-stone-500">{user.email}</div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-200 text-stone-700 uppercase tracking-wide">
            Current: {user.status}
          </span>
        </div>

        {/* Status Selection Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select New Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['active', 'suspended', 'banned'] as UserStatus[]).map((st) => {
              const isSelected = status === st;
              return (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                  data-testid={`status-option-${st}`}
                >
                  {getStatusIcon(st)}
                  <span className="text-xs font-bold capitalize text-slate-800">{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Administrative Reason {(status === 'suspended' || status === 'banned') && <span className="text-rose-600">*</span>}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              status === 'active'
                ? 'Optional notes regarding account activation...'
                : 'Reason for suspension or ban (e.g. Terms of service violation, scam activity)...'
            }
            className="w-full p-2.5 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
            data-testid="status-reason-input"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
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
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            data-testid="save-status-button"
          >
            {isLoading ? 'Updating...' : 'Save Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
