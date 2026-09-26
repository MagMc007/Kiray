'use client';

import React, { useEffect, useCallback } from 'react';
import {
  X,
  Building,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Download,
  Shield,
  Ban,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useGetUserDetailQuery,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '@/features/admin/users/adminUserApi';
import { formatDate } from '@/lib/format';
import type { User } from '@/types/user';

interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onOpenStatusModal: (user: User) => void;
  onOpenRoleModal: (user: User) => void;
  onExportData: (user: User) => void;
  isCurrentUserSelf?: boolean;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  onOpenStatusModal,
  onOpenRoleModal,
  onExportData,
  isCurrentUserSelf = false,
}) => {
  const { data: detailData, isLoading, isError, refetch } = useGetUserDetailQuery(
    userId || '',
    { skip: !userId || !isOpen }
  );

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [restoreUser, { isLoading: isRestoring }] = useRestoreUserMutation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const user = detailData?.user;
  const stats = detailData?.stats;

  const handleDeleteOrRestore = async () => {
    if (!user) return;
    if (user.isDeleted) {
      if (confirm(`Restore account for ${user.displayName}?`)) {
        await restoreUser(user._id);
        refetch();
      }
    } else {
      if (
        confirm(
          `Soft-delete account for ${user.displayName}? Their active listings will be deactivated.`
        )
      ) {
        await deleteUser(user._id);
        refetch();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
      data-testid="user-detail-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                Member Profile
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                User Details &amp; Activity
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              aria-label="Close user details"
              data-testid="close-drawer-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4" data-testid="user-detail-loading">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              </div>
            ) : isError || !user ? (
              <div className="p-6 text-center space-y-3" data-testid="user-detail-error">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-stone-600 font-medium">
                  Failed to load member profile details.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1.5 text-xs font-bold bg-orange-600 text-white rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* User Card */}
                <div className="flex items-start gap-4">
                  <UserAvatar
                    photoURL={user.photoURL}
                    name={user.displayName}
                    size="lg"
                    className="rounded-2xl shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        {user.displayName}
                      </h3>
                      {user.isVerified && (
                        <span title="Verified Member">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{user.email}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 capitalize">
                        {user.role}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.status}
                      </span>
                      {user.isDeleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-700">
                          Soft Deleted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Stats Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Platform Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                      <div className="flex items-center justify-between text-stone-400 mb-1">
                        <span className="text-[11px] font-bold">Total Listings</span>
                        <Building className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {stats?.totalListings ?? user.totalListings ?? 0}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                      <div className="flex items-center justify-between text-stone-400 mb-1">
                        <span className="text-[11px] font-bold">Active Listings</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {stats?.activeListings ?? user.activeListings ?? 0}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                      <div className="flex items-center justify-between text-stone-400 mb-1">
                        <span className="text-[11px] font-bold">Deleted Listings</span>
                        <Trash2 className="w-4 h-4 text-stone-400" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {stats?.deletedListings ?? 0}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                      <div className="flex items-center justify-between text-stone-400 mb-1">
                        <span className="text-[11px] font-bold">Reports Filed</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {stats?.reportsSubmitted ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Registration Information */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Contact &amp; Profile Details
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" /> Phone:
                      </span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {user.phone || 'Not provided'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" /> Joined:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-stone-400" /> Profile Completed:
                      </span>
                      <span
                        className={`font-bold ${
                          user.profileCompleted ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {user.profileCompleted ? 'Yes' : 'Pending'}
                      </span>
                    </div>

                    {user.bio && (
                      <div className="pt-2">
                        <span className="text-stone-500 block mb-1 font-semibold">Bio:</span>
                        <p className="p-3 bg-stone-50 rounded-xl text-stone-700 leading-relaxed italic">
                          "{user.bio}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action CTAs at bottom */}
          {user && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(user)}
                  disabled={isCurrentUserSelf}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                  data-testid="drawer-status-btn"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                  <span>Update Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenRoleModal(user)}
                  disabled={isCurrentUserSelf}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                  data-testid="drawer-role-btn"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-600" />
                  <span>Change Role</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onExportData(user)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  data-testid="drawer-export-btn"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export GDPR Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteOrRestore}
                  disabled={isCurrentUserSelf || isDeleting || isRestoring}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 border ${
                    user.isDeleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                  data-testid="drawer-delete-restore-btn"
                >
                  {user.isDeleted ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRestoring ? 'Restoring...' : 'Restore User'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'Deleting...' : 'Soft Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
