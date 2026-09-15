'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  MessageCircle,
  ChevronLeft,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setCurrentUser, selectCurrentUser } from '../authSlice';
import type { User, UserRole } from '@/types/user';

interface AuthPageLayoutProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  initialMode = 'login',
  initialRole = 'rentee',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const handleAuthSuccess = (user?: User) => {
    if (redirectUrl && redirectUrl !== '/') {
      router.push(redirectUrl);
      return;
    }

    const role = user?.role || currentUser?.role;
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'landlord') {
      router.push('/dashboard/landlord');
    } else {
      router.push('/dashboard/rentee');
    }
  };

  // Instant demo access for fast local testing and inspection
  const handleQuickDemo = (role: 'rentee' | 'landlord' | 'admin') => {
    const demoUser: User = {
      _id: `usr_${role}`,
      firebaseUid: `fb_${role}_demo`,
      role,
      status: 'active',
      displayName:
        role === 'admin'
          ? 'Kiray Admin'
          : role === 'landlord'
          ? 'Dawit Bekele'
          : 'Helen Desta',
      email: `${role}@kiray.et`,
      profileCompleted: true,
      phone: '+251 91 123 4567',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(
      setCredentials({
        firebaseUid: demoUser.firebaseUid,
        idToken: `demo_token_${role}`,
      })
    );
    dispatch(setCurrentUser(demoUser));

    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'landlord') {
      router.push('/dashboard/landlord');
    } else {
      router.push('/dashboard/rentee');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col py-3 sm:py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row: Home Link + Compact Instant Demo Bar */}
      <div className="max-w-5xl w-full mx-auto mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:text-orange-600 font-bold text-xs shadow-xs border border-stone-200 transition group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Kiray Home</span>
        </Link>

        {/* Compact Demo switcher */}
        <div className="flex items-center gap-1.5 text-xs bg-orange-50 border border-orange-200 rounded-xl px-2.5 py-1 shadow-2xs">
          <span className="text-orange-900 hidden sm:inline text-[11px] font-bold">Demo:</span>
          <button
            type="button"
            onClick={() => handleQuickDemo('rentee')}
            className="px-2 py-0.5 bg-white hover:bg-orange-600 hover:text-white text-slate-700 text-[11px] font-semibold rounded-md border border-stone-200 shadow-2xs transition"
          >
            👤 Rentee
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('landlord')}
            className="px-2 py-0.5 bg-white hover:bg-orange-600 hover:text-white text-slate-700 text-[11px] font-semibold rounded-md border border-stone-200 shadow-2xs transition"
          >
            🏠 Landlord
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-md shadow-2xs transition"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center my-auto w-full max-w-5xl mx-auto">
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 grid grid-cols-1 md:grid-cols-12">
          {/* Left Panel: Addis Ababa Skyline at Night */}
          <div className="md:col-span-5 bg-slate-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex min-h-[560px]">
            {/* Background Cityscape Image with Dark Contrast Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src="/auth-bg.png"
                alt="Addis Ababa Night Skyline"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90" />
              <div className="absolute inset-0 bg-radial from-orange-600/10 via-transparent to-slate-950/50" />
            </div>

            {/* Top Logo & Motto */}
            <div className="relative z-10 space-y-2">
              <Logo size="md" variant="dark" showMotto={true} />
              <p className="text-xs font-medium text-orange-400">
                Your journey to a new home, made simple.
              </p>
            </div>

            {/* Center Pitch */}
            <div className="relative z-10 my-4 space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-display font-extrabold text-xl lg:text-2xl text-white leading-tight">
                  Peer-to-peer rentals. <br />
                  <span className="text-orange-500">Transparent. Simple. Local.</span>
                </h2>
                <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
                  Connect directly with property owners in Addis and surrounding areas. No middlemen. No commissions.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Map First Discovery</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Explore neighborhoods and find places that fit your lifestyle.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Verified &amp; Transparent</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      See public contact info, real photos, and honest reviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Direct &amp; Fair</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Talk directly with owners. No hidden fees, no surprises.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Tagline */}
            <div className="relative z-10 pt-3 border-t border-white/10 text-[11px] text-stone-400">
              <span>Addis Ababa, Ethiopia • Zero Broker Fees Guaranteed</span>
            </div>
          </div>

          {/* Right Panel: Form Card with Tab Switcher */}
          <div className="md:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
            {/* Mobile Header with Logo for screens where left panel is hidden */}
            <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <Logo size="sm" />
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                Zero Commission
              </span>
            </div>

            <div>
              {/* Tabs Header */}
              <div className="flex border-b border-stone-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 pb-3 text-center text-xs sm:text-sm font-bold transition relative ${
                    activeTab === 'login'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-stone-500 hover:text-slate-800'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 pb-3 text-center text-xs sm:text-sm font-bold transition relative ${
                    activeTab === 'register'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-stone-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Active Form */}
              {activeTab === 'login' ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setActiveTab('register')}
                />
              ) : (
                <RegisterForm
                  initialRole={initialRole}
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setActiveTab('login')}
                />
              )}
            </div>

            {/* Footer Safety Notice */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                Never pay before viewing
              </span>
              <span>|</span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                Verify renter profile first
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
