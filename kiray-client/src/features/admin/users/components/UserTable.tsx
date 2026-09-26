'use client';

import React, { useState } from 'react';
import {
  Search,
  Users,
  Download,
  Trash2,
  RotateCcw,
  Ban,
  Eye,
  Shield,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useListUsersQuery,
  useLazyExportUserDataQuery,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '@/features/admin/users/adminUserApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { UserStatusModal } from './UserStatusModal';
import { UserRoleModal } from './UserRoleModal';
import { UserDetailDrawer } from './UserDetailDrawer';
import type { User, UserRole, UserStatus } from '@/types/user';

export const UserTable: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selected User for Modals/Drawers
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  // API Queries & Mutations
  const { data, isLoading, isFetching, isError, refetch } = useListUsersQuery({
    page,
    limit,
    role: selectedRole === 'all' ? undefined : selectedRole,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    search: search.trim() || undefined,
  });

  const [triggerExport, { isFetching: isExporting }] = useLazyExportUserDataQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();

  const users = data?.users || [];
  const meta = data?.meta || { page: 1, limit, total: 0, totalPages: 1 };
  const totalPages = meta.totalPages ?? 1;

  // Handle GDPR Export
  const handleExportData = async (targetUser: User) => {
    try {
      const result = await triggerExport(targetUser._id, true).unwrap();
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kiray-user-${targetUser.displayName.replace(/\s+/g, '_')}-${targetUser._id}-gdpr.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export user compliance package. Please try again.');
    }
  };

  const handleDeleteOrRestore = async (targetUser: User) => {
    if (targetUser._id === currentUser?._id) {
      alert('Administrators cannot delete their own account.');
      return;
    }

    if (targetUser.isDeleted) {
      if (confirm(`Restore account for ${targetUser.displayName}?`)) {
        await restoreUser(targetUser._id);
        refetch();
      }
    } else {
      if (
        confirm(
          `Soft-delete account for ${targetUser.displayName}? This deactivates their active listings.`
        )
      ) {
        await deleteUser(targetUser._id);
        refetch();
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="user-management-table-container">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold mb-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span>Member Directory</span>
          </div>
          <h2 className="font-display font-extrabold text-slate-900 text-xl">
            User Accounts &amp; Access Controls
          </h2>
          <p className="text-xs text-stone-500">
            Manage platform members, assign permissions, adjust moderation standing, and export GDPR data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:border-orange-500 bg-white"
              data-testid="user-search-input"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as UserRole | 'all');
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white outline-none cursor-pointer"
            data-testid="user-role-filter"
          >
            <option value="all">All Roles</option>
            <option value="rentee">Rentee</option>
            <option value="landlord">Landlord</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as UserStatus | 'all');
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white outline-none cursor-pointer"
            data-testid="user-status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <span
            className="text-xs text-stone-600 font-bold bg-stone-100 px-3 py-2 rounded-xl whitespace-nowrap"
            data-testid="total-users-pill"
          >
            {meta.total} users
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4"
          data-testid="user-table-error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs sm:text-sm">
              Failed to load user accounts from server.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm" data-testid="user-table">
          <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-[11px] border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading || isFetching ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Skeleton className="h-7 w-28 ml-auto rounded-lg" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={5} className="py-12 text-center" data-testid="user-table-empty">
                  <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">No members found</p>
                  <p className="text-xs text-stone-500">
                    Try adjusting your search query, role filter, or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              // User Rows
              users.map((user) => {
                const isSelf = user._id === currentUser?._id;
                return (
                  <tr
                    key={user._id}
                    className="hover:bg-stone-50/60 transition"
                    data-testid={`user-row-${user._id}`}
                  >
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          photoURL={user.photoURL}
                          name={user.displayName}
                          size="sm"
                          className="rounded-xl shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.displayName}</span>
                            {user.isVerified && (
                              <span title="Verified">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {isSelf ? (
                        <span
                          className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-lg inline-flex items-center gap-1"
                          data-testid="admin-self-badge"
                        >
                          <Shield className="w-3 h-3 text-orange-600" />
                          <span>Admin (You)</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRoleModalUser(user)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-800 transition cursor-pointer capitalize flex items-center gap-1"
                          data-testid={`change-role-btn-${user._id}`}
                          title="Click to change role"
                        >
                          <span>{user.role}</span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          user.status === 'suspended' || user.status === 'banned'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                        data-testid={`status-badge-${user._id}`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-xs text-stone-600 font-mono">
                      {user.phone || 'No phone'}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {/* View Detail Drawer */}
                      <button
                        onClick={() => setDetailUserId(user._id)}
                        className="p-1.5 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        title="View user details & activity"
                        data-testid={`view-detail-btn-${user._id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Export GDPR Data */}
                      <button
                        onClick={() => handleExportData(user)}
                        disabled={isExporting}
                        className="p-1.5 text-stone-500 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition cursor-pointer disabled:opacity-40"
                        title="Export GDPR Data Package (JSON)"
                        data-testid={`export-user-btn-${user._id}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Suspend / Status Dialog */}
                      {!isSelf && (
                        <button
                          onClick={() => setStatusModalUser(user)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            user.status === 'suspended' || user.status === 'banned'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Update account standing"
                          data-testid={`status-modal-btn-${user._id}`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {/* Soft Delete / Restore */}
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteOrRestore(user)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title={user.isDeleted ? 'Restore account' : 'Soft delete account'}
                          data-testid={`delete-user-btn-${user._id}`}
                        >
                          {user.isDeleted ? (
                            <RotateCcw className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between gap-4 pt-2 text-xs"
          data-testid="user-table-pagination"
        >
          <span className="text-stone-500 font-medium">
            Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({meta.total} total members)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1 || isFetching}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 font-bold disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              data-testid="pagination-prev"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={meta.page >= totalPages || isFetching}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 font-bold disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              data-testid="pagination-next"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals & Slide-over Drawer */}
      <UserStatusModal
        isOpen={Boolean(statusModalUser)}
        onClose={() => setStatusModalUser(null)}
        user={statusModalUser}
        onSuccess={() => refetch()}
      />

      <UserRoleModal
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        user={roleModalUser}
        onSuccess={() => refetch()}
      />

      <UserDetailDrawer
        isOpen={Boolean(detailUserId)}
        onClose={() => setDetailUserId(null)}
        userId={detailUserId}
        onOpenStatusModal={(u) => setStatusModalUser(u)}
        onOpenRoleModal={(u) => setRoleModalUser(u)}
        onExportData={(u) => handleExportData(u)}
        isCurrentUserSelf={detailUserId === currentUser?._id}
      />
    </div>
  );
};
