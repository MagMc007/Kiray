'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ReactReduxContext } from 'react-redux';
import { Logo } from './Logo';
import { MapPin, ShieldCheck, Home, Map, Info, BookOpen, Send } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface FooterProps {
  onOpenHowItWorks?: () => void;
  onOpenSafetyTips?: () => void;
  onOpenCreateListing?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowItWorks,
  onOpenSafetyTips,
  onOpenCreateListing,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const reduxContext = useContext(ReactReduxContext);
  const currentUser = reduxContext?.store?.getState?.()?.auth?.currentUser;

  const handleListProperty = () => {
    if (onOpenCreateListing) {
      onOpenCreateListing();
      return;
    }
    if (!currentUser) {
      router.push('/register?role=landlord');
    } else {
      router.push('/dashboard/landlord/listings/new');
    }
  };

  const handleHowItWorks = () => {
    if (onOpenHowItWorks) {
      onOpenHowItWorks();
      return;
    }
    if (pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '#how-it-works');
        }
        return;
      }
    }
    router.push('/#how-it-works');
  };

  const handleSafetyTips = () => {
    if (onOpenSafetyTips) {
      onOpenSafetyTips();
      return;
    }
    if (pathname === '/') {
      const el = document.getElementById('safety-tips');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '#safety-tips');
        }
        return;
      }
    }
    router.push('/#safety-tips');
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="bg-white/10 p-2.5 rounded-2xl inline-block">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {t.footer.brandDesc}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                {t.footer.verifiedLandlords}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                {t.footer.mapboxPinpointed}
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.exploreTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/listings" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.browseAllRentals}
                </Link>
              </li>
              <li>
                <Link href="/listings?sort=newest" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.newestListings}
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=apartment" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.apartments}
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=studio" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.studios}
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=villa" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.villasHouses}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.platformTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={handleListProperty}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.listYourProperty}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleHowItWorks}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.howKirayWorks}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleSafetyTips}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.safetyGuide}
                </button>
              </li>
              <li>
                <Link href="/listings?view=map" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Map className="w-3.5 h-3.5 shrink-0" />
                  {t.footer.mapView}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.communityTitle}
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>{t.footer.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <a href="https://t.me/Kiray_p2p_rentals" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition">
                  {t.footer.telegramCommunity}
                </a>
              </p>
              <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                {t.footer.communityDesc}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
