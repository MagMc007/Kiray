'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin, ShieldCheck, Mail, Home, Map, Info, BookOpen } from 'lucide-react';

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
              Kiray is Addis Ababa&apos;s peer-to-peer rental marketplace. We eliminate
              middlemen and connect renters directly with verified property owners with no fees.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Verified Landlords
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                Mapbox Pinpointed
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/listings" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  Browse All Rentals
                </Link>
              </li>
              <li>
                <Link href="/listings?sort=newest" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  Newest Listings
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=apartment" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=studio" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  Studios
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=villa" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  Villas &amp; Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenCreateListing}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  List Your Property (Free)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenHowItWorks}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  How Kiray Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSafetyTips}
                  className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer text-left w-full"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  Safety &amp; Anti-Scam Guide
                </button>
              </li>
              <li>
                <Link href="/listings" className="flex items-center gap-2 hover:text-orange-400 transition">
                  <Map className="w-3.5 h-3.5 shrink-0" />
                  Map View
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Community &amp; Support
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <a href="mailto:support@kiray.et" className="hover:text-orange-400 transition">
                  support@kiray.et
                </a>
              </p>
              <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                Built for modern renters and landlords across Ethiopia. No hidden fees,
                no brokers — just direct connections.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Kiray Rental Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Landlord Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
