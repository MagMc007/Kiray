'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, Search, Bookmark, Sparkles } from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useFavorites, SavedListingsGrid } from '@/features/favorites';
import { useTranslation } from '@/i18n';

export default function RenteeDashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { savedCount } = useFavorites();
  const { t } = useTranslation();

  const welcomeText = t.renteeDashboard.welcomeBack.replace(
    '{name}',
    currentUser?.displayName || t.auth.roleRenteeName
  );

  return (
    <AuthGuard requiredRole="rentee">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header Profile & Quick Stats Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-slate-900">
                  {t.renteeDashboard.title}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {welcomeText} &bull;{' '}
                <span className="font-medium text-slate-700">
                  {savedCount}{' '}
                  {savedCount === 1
                    ? t.renteeDashboard.savedCountHome
                    : t.renteeDashboard.savedCountHomes}{' '}
                  {t.renteeDashboard.savedCountSaved}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Search className="w-4 h-4" />
              <span>{t.renteeDashboard.browseHomesBtn}</span>
            </Link>
          </div>
        </div>

        {/* Saved Listings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-orange-600" />
                <h2 className="font-display font-bold text-xl text-slate-900">
                  {t.renteeDashboard.savedSectionTitle}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {t.renteeDashboard.savedSectionSubtitle}
              </p>
            </div>
          </div>

          <SavedListingsGrid />
        </section>
      </div>
    </AuthGuard>
  );
}
