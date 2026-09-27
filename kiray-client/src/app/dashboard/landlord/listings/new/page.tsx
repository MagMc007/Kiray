'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { ListingForm } from '@/features/listings/components/ListingForm';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useLandlordListingLimit } from '@/features/listings/useLandlordListingLimit';

export default function NewListingPage() {
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);
  const { totalListings, isLimitReached, maxLimit, isLoading: isCheckingLimit } = useLandlordListingLimit();
  const isVerifiedLandlord = Boolean(
    currentUser?.profileCompleted || currentUser?.isVerified
  );

  return (
    <AuthGuard requiredRole="landlord">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation / Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link
            href="/dashboard/landlord"
            className="hover:text-stone-800 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landlord Portal</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Publish Listing</span>
        </div>

        {/* Loading check */}
        {isCheckingLimit ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-xs text-stone-500">Checking listing quota...</p>
          </div>
        ) : isLimitReached ? (
          /* Listing Limit Reached Gate (Max 10) */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-xl mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display text-slate-900">
                Maximum Listing Limit Reached ({totalListings}/{maxLimit})
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
                Each property owner on Kiray is limited to a maximum of <strong>{maxLimit} total listings</strong> (across all statuses). To publish a new property, please manage or remove one of your existing listings.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/landlord"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
              >
                <span>Manage Existing Listings</span>
              </Link>
            </div>
          </div>
        ) : !isVerifiedLandlord ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-xl mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display text-slate-900">
                Profile Verification Required
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
                To protect renters and maintain listing authenticity, landlords must complete their profile with their <strong>Full Name</strong> and <strong>Phone Number</strong> before publishing rental listings.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/landlord"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
              >
                <span>Complete Profile in Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Listing Creation Form */
          <ListingForm
            mode="create"
            onSubmitSuccess={() => {
              router.push('/dashboard/landlord');
            }}
            onCancel={() => {
              router.push('/dashboard/landlord');
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}

