'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { useGetUserProfileQuery, useGetUserListingsQuery } from '@/features/users/userApi';
import { useTrackContactClickMutation } from '@/features/listings/listingsApi';
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Clock,
  Calendar,
  Building,
  Home,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export interface OwnerProfilePageProps {
  params: Promise<{ id: string }>;
}

function OwnerProfileContent({ params }: OwnerProfilePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams?.id || '';

  const {
    data: owner,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useGetUserProfileQuery(userId, { skip: !userId });

  const {
    data: listingsData,
    isLoading: isLoadingListings,
  } = useGetUserListingsQuery({ userId }, { skip: !userId });

  const [trackContactClick] = useTrackContactClickMutation();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const listings = listingsData?.results || listingsData?.data || [];
  const primaryListingId = listings[0]?._id;

  const handleContactAction = (method: 'call' | 'whatsapp') => {
    if (primaryListingId) {
      trackContactClick(primaryListingId).catch(() => {});
    }
  };

  const ownerName = owner?.displayName || owner?.fullName || 'Property Host';
  const ownerPhone = owner?.phone || (owner?.phoneNumber && owner.phoneNumber[0]);
  const ownerWhatsapp = owner?.whatsapp || ownerPhone;
  const isVerified = owner?.isVerified ?? true;
  const memberSince = owner?.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2025';

  const handleCopyPhone = () => {
    if (ownerPhone && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ownerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9]">
        <Navbar />
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-6 w-48 bg-stone-200 rounded-md" />
          <div className="h-64 bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-64 bg-stone-200 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-80 bg-stone-200 rounded-3xl" />
              <div className="h-80 bg-stone-200 rounded-3xl" />
              <div className="h-80 bg-stone-200 rounded-3xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isProfileError || !owner) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">
            Host Profile Not Found
          </h2>
          <p className="text-sm text-stone-500 mb-6">
            The landlord or property host you are looking for does not exist or may have been deactivated.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse all listings</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] text-[#1e293b]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-stone-800">
            Listings
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium truncate max-w-xs">{ownerName}</span>
        </div>

        {/* Landlord Hero Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative">
                <UserAvatar
                  name={ownerName}
                  photoURL={owner.photoURL}
                  size="lg"
                  rounded="rounded-3xl"
                  ring="ring-4 ring-orange-500/20 shadow-md"
                />
                {isVerified && (
                  <span
                    title="Verified Host"
                    className="absolute -bottom-1.5 -right-1.5 p-1 bg-white rounded-full shadow-xs"
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                    {ownerName}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Landlord</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Responds in ~{owner.responseTime || 1} hr</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Member since {memberSince}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                    <Building className="w-3.5 h-3.5 text-orange-600" />
                    <span>
                      {listings.length} Available {listings.length === 1 ? 'Property' : 'Properties'}
                    </span>
                  </span>
                </div>

                {owner.bio && (
                  <p className="text-xs sm:text-sm text-stone-600 pt-1.5 leading-relaxed max-w-2xl">
                    {owner.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[200px]">
              {ownerPhone ? (
                <a
                  href={`tel:${ownerPhone}`}
                  onClick={() => handleContactAction('call')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {ownerPhone}</span>
                </a>
              ) : (
                <div className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl text-xs font-semibold text-center">
                  Phone Available on Request
                </div>
              )}

              {ownerWhatsapp && (
                <a
                  href={`https://wa.me/${ownerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContactAction('whatsapp')}
                  className="px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {ownerPhone && (
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 text-xs font-medium rounded-xl hover:bg-stone-50 transition inline-flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200/80"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Number copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy phone</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Direct Owner Policy: No broker fees or finder commissions required.</span>
            </div>
            <span className="font-semibold text-emerald-600">Zero Middlemen Guaranteed</span>
          </div>
        </div>

        {/* Listings by this Host */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-600" />
              <h2 className="font-display font-bold text-xl text-slate-900">
                Available Properties by {ownerName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
                {listings.length}
              </span>
            </div>

            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Direct Landlord Listings
            </span>
          </div>

          {isLoadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              <div className="h-80 bg-stone-200 rounded-3xl" />
              <div className="h-80 bg-stone-200 rounded-3xl" />
              <div className="h-80 bg-stone-200 rounded-3xl" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  onSelectListing={(l) => router.push(`/listings/${l.slug || l._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl mx-auto flex items-center justify-center">
                <Home className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-slate-900">
                  No active properties right now
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {ownerName} does not currently have any active rental properties listed on Kiray.
                </p>
              </div>
              <Link
                href="/listings"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Explore all properties</span>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function OwnerProfilePage(props: OwnerProfilePageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OwnerProfileContent {...props} />
    </React.Suspense>
  );
}
