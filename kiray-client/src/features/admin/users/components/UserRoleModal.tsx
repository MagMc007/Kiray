'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, User as UserIcon, Building, ShieldAlert } from 'lucide-react';
import { useUpdateUserRoleMutation } from '@/features/admin/users/adminUserApi';
import type { User, UserRole } from '@/types/user';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [role, setRole] = useState<UserRole>('rentee');
  const [formError, setFormError] = useState<string | null>(null);

  const [updateRole, { isLoading }] = useUpdateUserRoleMutation();

  useEffect(() => {
    if (user) {
      setRole(user.role || 'rentee');
      setFormError(null);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (role === user.role) {
      onClose();
      return;
    }

    try {
      await updateRole({
        id: user._id,
        role,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to update user role.');
    }
  };

  const rolesList: { role: UserRole; title: string; description: string; icon: typeof UserIcon }[] = [
    {
      role: 'rentee',
      title: 'Rentee / Seeker',
      description: 'Search properties, save favorites, leave comments, and contact landlords.',
      icon: UserIcon,
    },
    {
      role: 'landlord',
      title: 'Landlord / Property Owner',
      description: 'Create and manage listings, upload rental photos, and receive tenant leads.',
      icon: Building,
    },
    {
      role: 'admin',
      title: 'Platform Administrator',
      description: 'Full moderation privileges, user governance, audit logs, and system settings.',
      icon: ShieldCheck,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change User Role"
      description={`Modify access privileges and permissions for ${user.displayName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="user-role-modal-form">
        {/* Error Alert */}
        {formError && (
          <div
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
            data-testid="role-form-error"
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
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-100 text-orange-800 capitalize">
            Current: {user.role}
          </span>
        </div>

        {/* Role Options */}
        <div className="space-y-2">
          {rolesList.map((item) => {
            const Icon = item.icon;
            const isSelected = role === item.role;
            return (
              <button
                type="button"
                key={item.role}
                onClick={() => setRole(item.role)}
                className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20 shadow-2xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
                data-testid={`role-option-${item.role}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-orange-500 text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</div>
                  <div className="text-xs text-stone-500 leading-relaxed">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning if Elevating to Admin */}
        {role === 'admin' && user.role !== 'admin' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Elevated Privilege Warning:</span> Granting the Administrator role permits this account to manage all users, override listings, and access platform governance.
            </div>
          </div>
        )}

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
            disabled={isLoading || role === user.role}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            data-testid="save-role-button"
          >
            {isLoading ? 'Updating...' : 'Assign Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
