'use client';

import React, { useState } from 'react';
import type { ListingImage } from '@/types/listing';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  propertyType?: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({
  images = [],
  title,
  isVerified,
  isFeatured,
  propertyType,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
            publicId: 'default',
            order: 0,
          },
        ];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full space-y-3">
      {/* Main Image Viewport */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-stone-900 rounded-3xl overflow-hidden shadow-sm group">
        <img
          src={displayImages[currentIndex]?.url}
          alt={`${title} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover select-none transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
          {propertyType && (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {propertyType}
            </span>
          )}
          {isVerified && (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              ✓ Verified
            </span>
          )}
          {isFeatured && (
            <span className="bg-amber-500/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
              ★ Featured
            </span>
          )}
        </div>

        {/* Image Counter & Lightbox Button */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Open fullscreen gallery"
            className="p-2 bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-xs text-white rounded-full transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="bg-stone-900/70 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {displayImages.length}
          </span>
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/50 hover:bg-stone-900/80 text-white backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/50 hover:bg-stone-900/80 text-white backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {displayImages.map((img, idx) => (
            <button
              key={img.publicId || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
              className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-emerald-600 ring-2 ring-emerald-600/30 opacity-100 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          <div className="w-full flex items-center justify-between text-white p-4 max-w-5xl">
            <span className="text-sm font-medium">
              {currentIndex + 1} of {displayImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen view"
              className="p-2 text-white/80 hover:text-white rounded-full bg-stone-800/60 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center flex-1">
            <img
              src={displayImages[currentIndex]?.url}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-xl"
            />

            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 p-3 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 p-3 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
