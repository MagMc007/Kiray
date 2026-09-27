'use client';

import React from 'react';
import { MapPin, Home, Star, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface TrustRibbonProps {
  onMapClick?: () => void;
  onOwnersClick?: () => void;
  onReviewsClick?: () => void;
  onReportClick?: () => void;
}

export const TrustRibbon: React.FC<TrustRibbonProps> = ({
  onMapClick,
  onOwnersClick,
  onReviewsClick,
  onReportClick,
}) => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#fcfaf5] border border-stone-200/80 rounded-3xl py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Feature 1: Map First Discovery */}
          <div
            onClick={onMapClick}
            className="flex items-start gap-3.5 group cursor-pointer p-2 rounded-xl hover:bg-white/60 transition"
          >
            <div className="mt-1 p-2 rounded-xl bg-orange-100/70 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-200 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                {t.trustRibbon.mapTitle}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.trustRibbon.mapDesc}
              </p>
            </div>
          </div>

          {/* Feature 2: Verified Owners */}
          <div
            onClick={onOwnersClick}
            className="flex items-start gap-3.5 group cursor-pointer p-2 rounded-xl hover:bg-white/60 transition"
          >
            <div className="mt-1 p-2 rounded-xl bg-orange-100/70 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-200 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                {t.trustRibbon.ownersTitle}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.trustRibbon.ownersDesc}
              </p>
            </div>
          </div>

          {/* Feature 3: Reviews & Ratings */}
          <div
            onClick={onReviewsClick}
            className="flex items-start gap-3.5 group cursor-pointer p-2 rounded-xl hover:bg-white/60 transition"
          >
            <div className="mt-1 p-2 rounded-xl bg-orange-100/70 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-200 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                {t.trustRibbon.reviewsTitle}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.trustRibbon.reviewsDesc}
              </p>
            </div>
          </div>

          {/* Feature 4: Report Suspicious Listings */}
          <div
            onClick={onReportClick}
            className="flex items-start gap-3.5 group cursor-pointer p-2 rounded-xl hover:bg-white/60 transition"
          >
            <div className="mt-1 p-2 rounded-xl bg-orange-100/70 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                {t.trustRibbon.safetyTitle}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.trustRibbon.safetyDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
