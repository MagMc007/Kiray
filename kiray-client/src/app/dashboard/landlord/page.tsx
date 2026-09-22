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
  MessageCircle,
  Sparkles,
  Check,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AuthGuard } from '@/components/feedback/AuthGuard';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
  useGetMyListingsQuery,
  useUpdateProfileMutation,
  useUpdateContactMutation,
} from '@/features/users/userApi';
import { MyListingsTable } from '@/features/listings/components/MyListingsTable';
import { validateEthiopianPhone } from '@/lib/validation/phoneValidation';

type ActiveTab = 'listings' | 'inquiries' | 'profile';

export default function LandlordDashboardPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<ActiveTab>('listings');

  // Fetch Landlord Listings
  const { data: myData, isLoading, refetch } = useGetMyListingsQuery();
  const myListings = myData?.results || [];

  // Profile Update Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateContact, { isLoading: isUpdatingContact }] = useUpdateContactMutation();

  // Profile Form State
  const [phone, setPhone] = useState(
    currentUser?.phone || (currentUser?.phoneNumber && currentUser.phoneNumber[0]) || ''
  );
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
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
    setPhoneError(null);
    setWhatsappError(null);

    // Validate phone number digit count and format (e.g. +251966204556)
    const phoneValidation = validateEthiopianPhone(phone, {
      fieldName: 'Primary phone number',
    });
    if (phone.trim() && !phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Invalid primary phone number');
      return;
    }

    // Validate WhatsApp number digit count and format (e.g. +251966204556)
    const whatsappValidation = validateEthiopianPhone(whatsapp, {
      fieldName: 'WhatsApp number',
    });
    if (whatsapp.trim() && !whatsappValidation.isValid) {
      setWhatsappError(whatsappValidation.error || 'Invalid WhatsApp number');
      return;
    }

    const finalPhone = phoneValidation.normalized;
    const finalWhatsapp = whatsappValidation.normalized;

    try {
      if (finalPhone || finalWhatsapp) {
        await updateContact({ phone: finalPhone, whatsapp: finalWhatsapp }).unwrap();
        setPhone(finalPhone);
        setWhatsapp(finalWhatsapp);
      }
      if (bio !== currentUser?.bio) {
        await updateProfile({ bio }).unwrap();
      }

      setProfileSuccess('Profile & contact information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 3500);
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
                  {currentUser?.displayName?.slice(0, 2).toUpperCase() || 'LL'}
                </div>
              )}
              {currentUser?.isVerified && (
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
                  {currentUser?.displayName || 'Property Owner'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  <Sparkles className="w-3 h-3" />
                  <span>Property Owner</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Managing {myListings.length} {myListings.length === 1 ? 'rental' : 'rentals'} in Addis Ababa • Zero broker commission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/landlord/listings/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Listing</span>
            </Link>
          </div>
        </div>

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
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Public Landlord Profile &amp; Contact Numbers
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Rentees will use these numbers to reach out directly via call or WhatsApp. Your phone number is verified and never sold to third parties.
              </p>
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

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Phone Number (Ethiopia)
                  <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                    (Format: +251 followed by 9 digits, e.g. +251966204556)
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

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  WhatsApp Number (Optional)
                  <span className="text-[11px] font-normal text-stone-500 ml-1.5">
                    (Format: +251 followed by 9 digits, e.g. +251966204556)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="+251966204556"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (whatsappError) setWhatsappError(null);
                  }}
                  onBlur={() => {
                    if (whatsapp.trim()) {
                      const res = validateEthiopianPhone(whatsapp, { fieldName: 'WhatsApp number' });
                      if (!res.isValid) {
                        setWhatsappError(res.error || 'Invalid WhatsApp number format');
                      } else {
                        setWhatsapp(res.normalized);
                        setWhatsappError(null);
                      }
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                    whatsappError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-stone-300 focus:border-orange-500'
                  }`}
                />
                {whatsappError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{whatsappError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Host Bio / Greeting
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Property manager for residential flats in Bole and Kazanchis. Responsive via phone and WhatsApp during business hours."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile || isUpdatingContact}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {isUpdatingProfile || isUpdatingContact ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
