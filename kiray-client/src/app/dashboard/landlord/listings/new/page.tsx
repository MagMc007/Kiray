'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building } from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { ListingForm } from '@/features/listings/components/ListingForm';

export default function NewListingPage() {
  const router = useRouter();

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

        {/* Listing Creation Form */}
        <ListingForm
          mode="create"
          onSubmitSuccess={() => {
            router.push('/dashboard/landlord');
          }}
          onCancel={() => {
            router.push('/dashboard/landlord');
          }}
        />
      </div>
    </AuthGuard>
  );
}
