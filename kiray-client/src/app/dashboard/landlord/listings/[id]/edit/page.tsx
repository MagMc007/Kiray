'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { useGetListingQuery } from '@/features/listings/listingsApi';
import { ListingForm } from '@/features/listings/components/ListingForm';

export interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

function EditListingPageContent({ params }: EditListingPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const listingId = resolvedParams?.id || '';

  const { data: listing, isLoading, isError } = useGetListingQuery(listingId, {
    skip: !listingId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Loading property details...</p>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 bg-white rounded-3xl p-8 border border-stone-200">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900">
          Listing Not Found
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
          The property you are trying to edit does not exist or may have been deleted.
        </p>
        <Link
          href="/dashboard/landlord"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landlord Portal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link
          href="/dashboard/landlord"
          className="hover:text-stone-800 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Landlord Portal</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Edit Property</span>
        <span>/</span>
        <span className="truncate max-w-[200px] text-stone-400">{listing.title}</span>
      </div>

      {/* Listing Form in Edit Mode */}
      <ListingForm
        mode="edit"
        initialListing={listing}
        onSubmitSuccess={() => {
          router.push('/dashboard/landlord');
        }}
        onCancel={() => {
          router.push('/dashboard/landlord');
        }}
      />
    </div>
  );
}

export default function EditListingPage(props: EditListingPageProps) {
  return (
    <AuthGuard requiredRole="landlord">
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <EditListingPageContent {...props} />
      </React.Suspense>
    </AuthGuard>
  );
}
