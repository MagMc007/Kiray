'use client';

import React from 'react';
import { UserCheck, Building, ArrowRight } from 'lucide-react';
import type { UserRole } from '@/types/user';
import { useTranslation } from '@/i18n';

interface RoleSelectProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onConfirm?: () => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  selectedRole,
  onSelectRole,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
          {t.auth.stepOneBadge}
        </span>
        <h3 className="font-display font-bold text-2xl text-slate-900">
          {t.auth.roleSelectTitle}
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          {t.auth.roleSelectSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Rentee Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onSelectRole('rentee');
            onConfirm?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectRole('rentee');
              onConfirm?.();
            }
          }}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer group shadow-xs space-y-3 flex flex-col justify-between ${
            selectedRole === 'rentee'
              ? 'border-orange-500 bg-orange-50/30'
              : 'border-stone-200 hover:border-orange-400 bg-white hover:bg-orange-50/20'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-orange-600">
              {t.auth.roleRenteeTitle}
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t.auth.roleRenteeDesc}
            </p>
          </div>
          <button
            type="button"
            className="w-full py-2 bg-stone-100 group-hover:bg-orange-600 group-hover:text-white text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>{t.auth.roleRenteeBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Landlord Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onSelectRole('landlord');
            onConfirm?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectRole('landlord');
              onConfirm?.();
            }
          }}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer group shadow-xs space-y-3 flex flex-col justify-between ${
            selectedRole === 'landlord'
              ? 'border-orange-500 bg-orange-50/30'
              : 'border-stone-200 hover:border-orange-400 bg-white hover:bg-orange-50/20'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-orange-600">
              {t.auth.roleOwnerTitle}
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t.auth.roleOwnerDesc}
            </p>
          </div>
          <button
            type="button"
            className="w-full py-2 bg-stone-100 group-hover:bg-orange-600 group-hover:text-white text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>{t.auth.roleOwnerBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
