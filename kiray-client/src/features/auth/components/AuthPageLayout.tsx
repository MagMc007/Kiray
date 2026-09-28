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
  Lock,
  UserCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '../authSlice';
import type { User, UserRole } from '@/types/user';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface AuthPageLayoutProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  initialMode = 'login',
  initialRole = 'rentee',
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const reason = searchParams.get('reason');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
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

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col py-3 sm:py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row: Home Link & Language Switcher */}
      <div className="max-w-5xl w-full mx-auto mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:text-orange-600 font-bold text-xs shadow-xs border border-stone-200 transition group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{t.auth.backToHome}</span>
        </Link>
        <LanguageSwitcher />
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
                {t.auth.leftMotto}
              </p>
            </div>

            {/* Center Pitch */}
            <div className="relative z-10 my-4 space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-display font-extrabold text-xl lg:text-2xl text-white leading-tight">
                  {t.auth.leftTitlePrefix} <br />
                  <span className="text-orange-500">{t.auth.leftTitleHighlight}</span>
                </h2>
                <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
                  {t.auth.leftDesc}
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{t.auth.pillarMapTitle}</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {t.auth.pillarMapDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{t.auth.pillarVerifiedTitle}</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {t.auth.pillarVerifiedDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-orange-400 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{t.auth.pillarDirectTitle}</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {t.auth.pillarDirectDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Tagline */}
            <div className="relative z-10 pt-3 border-t border-white/10 text-[11px] text-stone-400">
              <span>{t.auth.guaranteeFooter}</span>
            </div>
          </div>

          {/* Right Panel: Form Card with Tab Switcher */}
          <div className="md:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
            {/* Mobile Header with Logo for screens where left panel is hidden */}
            <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <Logo size="sm" />
            </div>

            <div>
              {/* Contextual notice if user was redirected to auth */}
              {reason && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3 text-xs text-amber-950 animate-fade-in shadow-2xs">
                  <div className="p-1.5 rounded-xl bg-amber-100/90 text-amber-800 shrink-0 mt-0.5">
                    {reason === 'contact' ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="leading-relaxed">
                    <span className="font-bold text-xs block text-stone-900">
                      {reason === 'contact'
                        ? t.auth.reasonContactTitle
                        : t.auth.reasonViewTitle}
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      {reason === 'contact'
                        ? t.auth.reasonContactDesc
                        : t.auth.reasonViewDesc}
                    </span>
                  </div>
                </div>
              )}

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
                  {t.auth.tabLogin}
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
                  {t.auth.tabRegister}
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
                {t.auth.neverPayNotice}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                {t.auth.verifyProfileNotice}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
