'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  PlusCircle,
  Eye,
  Heart,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Lock,
  MessageCircle,
  Sparkles,
  Check,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, setCurrentUser } from '@/features/auth/authSlice';
import {
  useGetMyListingsQuery,
  useUpdateProfileMutation,
} from '@/features/users/userApi';
import { MyListingsTable } from '@/features/listings/components/MyListingsTable';
import { validateEthiopianPhone } from '@/lib/validation/phoneValidation';

type ActiveTab = 'listings' | 'inquiries' | 'profile';

export default function LandlordDashboardPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<ActiveTab>('listings');

  const isVerifiedLandlord = Boolean(
    currentUser?.profileCompleted || currentUser?.isVerified
  );

  // Fetch Landlord Listings
  const { data: myData, isLoading, refetch } = useGetMyListingsQuery();
  const myListings = myData?.results || [];

  // Profile Update Mutation
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(
    (currentUser?.phoneNumber && currentUser.phoneNumber[0]) || currentUser?.phone || ''
  );
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');

  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Inquiries Reply State
  const [replyInput, setReplyInput] = useState<{ [commentId: string]: string }>({});
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // KPI Calculations
  const totalViews = myListings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
  const totalSaves = myListings.reduce((sum, l) => sum + (l.saveCount || 0), 0);
  const totalContacts = myListings.reduce((sum, l) => sum + (l.contactClickCount || 0), 0);
  const activeCount = myListings.filter((l) => l.status === 'open' && !l.isDeleted).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setFullNameError(null);
    setPhoneError(null);

    // Validate Full Name (required for verification)
    if (!fullName.trim()) {
      setFullNameError('Full Name is required for landlord verification.');
      return;
    }

    // Validate Phone Number (required for verification, format +251966204556)
    const phoneValidation = validateEthiopianPhone(phone, {
      required: true,
      fieldName: 'Primary phone number',
    });
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Valid primary phone number is required.');
      return;
    }

    // Profile is verified when both fullName and phone are completed
    const isComplete = Boolean(
      fullName.trim() && phoneValidation.isValid && phoneValidation.normalized
    );

    try {
      const updatedUser = await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: [phoneValidation.normalized],
        bio: bio.trim(),
        photoURL: photoURL.trim() || null,
        displayName: displayName.trim() || currentUser?.displayName,
        profileCompleted: isComplete,
      }).unwrap();

      dispatch(setCurrentUser(updatedUser));
      setPhone(phoneValidation.normalized);
      setProfileSuccess(
        isComplete
          ? 'Profile updated successfully! You are now a Verified Landlord.'
          : 'Profile updated successfully.'
      );
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err?.data?.error || err?.message || 'Failed to update landlord profile.');
    }
  };

  return (
    <AuthGuard requiredRole="landlord">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Profile & Quick Stats Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Landlord'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xl border-2 border-orange-500 shadow-xs">
                  {(currentUser?.displayName || currentUser?.fullName)?.slice(0, 2).toUpperCase() || 'LL'}
                </div>
              )}
              {isVerifiedLandlord && (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs"
                  title="Verified Property Owner"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-slate-900">
                  {currentUser?.displayName || currentUser?.fullName || 'Property Owner'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  <Sparkles className="w-3 h-3" />
                  <span>Property Owner</span>
                </span>
                {isVerifiedLandlord ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Managing {myListings.length} {myListings.length === 1 ? 'rental' : 'rentals'} in Addis Ababa • Zero broker commission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isVerifiedLandlord ? (
              <Link
                href="/dashboard/landlord/listings/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish New Listing</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                title="Complete your Full Name and Phone Number to publish listings"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-600 font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Lock className="w-4 h-4 text-stone-500" />
                <span>Publish New Listing (Verification Required)</span>
              </button>
            )}
          </div>
        </div>

        {/* Unverified Landlord Notice Banner */}
        {!isVerifiedLandlord && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Profile Verification Required to List Properties
                </h3>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Complete your <strong>Full Name</strong> and <strong>Primary Phone Number</strong> in your profile settings to earn your Verified Landlord badge and publish listings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4 Analytics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              Tenant discovery clicks
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Renter Saves</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalSaves.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500">
              Shortlisted in favorites
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Contact Inquiries</span>
              <PhoneCall className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalContacts.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              Direct call &amp; WhatsApp clicks
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
              <span>Active Listings</span>
              <Building className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {activeCount}
            </div>
            <div className="text-[11px] text-stone-500">
              Open on Addis map
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-stone-200 gap-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Rental Listings ({myListings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Renter Q&amp;A Inquiries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Landlord Profile &amp; Contact Info</span>
          </button>
        </div>

        {/* TAB 1: LISTINGS MANAGER */}
        {activeTab === 'listings' && (
          <MyListingsTable
            listings={myListings}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        )}

        {/* TAB 2: INQUIRIES & Q&A */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 leading-relaxed">
              💡 <strong>Prompt Responses Build Trust:</strong> Potential tenants ask public questions about backup power, water reservoirs, and lease deposits. Fast responses improve conversion rates significantly.
            </div>

            {replySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{replySuccess}</span>
              </div>
            )}

            {myListings.every((l) => !l.totalComments) ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                <MessageCircle className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">
                  No tenant inquiries yet
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  When rentees ask questions on your public listing pages, they will show up here for you to answer.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => {
                  if (!listing.totalComments) return null;

                  return (
                    <div
                      key={listing._id}
                      className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-600" />
                          <span>{listing.title}</span>
                        </div>
                        <Link
                          href={`/listings/${listing.slug || listing._id}`}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                        >
                          View listing →
                        </Link>
                      </div>

                      <p className="text-xs text-stone-500 italic">
                        {listing.totalComments} review(s) / question(s) posted on this listing.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LANDLORD PROFILE & CONTACT INFO */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Landlord Profile &amp; Verification Details
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Provide your Full Name and Primary Phone Number to earn your Verified Landlord badge and unlock listing publishing.
                </p>
              </div>
              {isVerifiedLandlord ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0 self-start sm:self-auto">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Verification Needed</span>
                </span>
              )}
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Full Name (Required *) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                    (Legal or business name)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alemayehu Tadesse"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                    fullNameError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-stone-300 focus:border-orange-500'
                  }`}
                />
                {fullNameError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fullNameError}</span>
                  </p>
                )}
              </div>

              {/* Primary Phone Number (Required *) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Phone Number (Ethiopia) <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                    (e.g. +251966204556)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="+251966204556"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  onBlur={() => {
                    if (phone.trim()) {
                      const res = validateEthiopianPhone(phone, { fieldName: 'Primary phone number' });
                      if (!res.isValid) {
                        setPhoneError(res.error || 'Invalid phone number format');
                      } else {
                        setPhone(res.normalized);
                        setPhoneError(null);
                      }
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                    phoneError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-stone-300 focus:border-orange-500'
                  }`}
                />
                {phoneError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Public Display Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Public Display Name <span className="text-[11px] font-normal text-stone-500 ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alemayehu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Profile Photo URL (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Profile Photo URL <span className="text-[11px] font-normal text-stone-500 ml-1">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Host Bio / Greeting (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Host Bio / Greeting <span className="text-[11px] font-normal text-stone-500 ml-1">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Property manager for residential flats in Bole and Kazanchis. Responsive via phone during business hours."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile & Update Verification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
