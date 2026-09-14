'use client';

import React from 'react';
import { Logo } from './Logo';
import { MapPin, ShieldCheck, Mail } from 'lucide-react';
import { ADDIS_NEIGHBORHOODS } from '@/lib/constants';

export interface FooterProps {
  onNeighborhoodClick?: (neighborhood: string) => void;
  onOpenHowItWorks?: () => void;
  onOpenSafetyTips?: () => void;
  onOpenCreateListing?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNeighborhoodClick,
  onOpenHowItWorks,
  onOpenSafetyTips,
  onOpenCreateListing,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/10 p-2.5 rounded-2xl inline-block">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Kiray is Addis Ababa&apos;s dedicated peer-to-peer rental marketplace. We eliminate
              middlemen and commission fees by connecting renters directly with verified property
              owners.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
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

          {/* Quick Neighborhoods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Rentals by Neighborhood
            </h4>
            <ul className="space-y-2 text-xs">
              {ADDIS_NEIGHBORHOODS
                .filter((n) => n !== 'All Neighborhoods')
                .slice(0, 6)
                .map((neighborhood) => (
                  <li key={neighborhood}>
                    <button
                      type="button"
                      onClick={() => onNeighborhoodClick?.(neighborhood)}
                      className="hover:text-orange-400 transition cursor-pointer text-stone-400 text-left"
                    >
                      Apartments in {neighborhood}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenCreateListing}
                  className="hover:text-orange-400 transition cursor-pointer text-left"
                >
                  List Your Property (Free)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenHowItWorks}
                  className="hover:text-orange-400 transition cursor-pointer text-left"
                >
                  How Kiray Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSafetyTips}
                  className="hover:text-orange-400 transition cursor-pointer text-left"
                >
                  Safety Guidelines &amp; Anti-Scam
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Community &amp; Support
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>support@kiray.et</span>
              </p>
              <p className="text-[11px] text-stone-500 pt-2 leading-relaxed">
                Built for modern renters and landlords across Ethiopia.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
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
