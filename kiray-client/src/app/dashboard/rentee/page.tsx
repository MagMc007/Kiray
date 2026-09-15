'use client';

import React from 'react';
import { UserCheck, Bookmark, Search } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function RenteeDashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <AuthGuard requiredRole="rentee">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-slate-900">
                Rentee Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Welcome back, {currentUser?.displayName || 'Rentee'}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Search className="w-4 h-4" />
            <span>Browse Addis Homes</span>
          </Link>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-orange-400 mx-auto" />
          <h2 className="font-display font-bold text-lg text-slate-900">
            Saved Listings &amp; Direct Inquiries
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Your saved properties and landlord contact history will connect in v0.4.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
