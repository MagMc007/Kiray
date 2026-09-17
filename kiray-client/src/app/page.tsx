'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { TrustRibbon } from '@/components/layout/TrustRibbon';
import { Footer } from '@/components/layout/Footer';
import type { Listing } from '@/types/listing';

export default function HomePage() {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectListing = (listing: Listing) => {
    router.push(`/listings/${listing.slug || listing._id}`);
  };

  const handleNeighborhoodClick = (neighborhood: string) => {
    router.push(`/listings?neighborhood=${encodeURIComponent(neighborhood)}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] text-[#1e293b]">
      {/* Top Header Navbar */}
      <Navbar favoritesCount={favoriteIds.length} />

      {/* Main Landing Content */}
      <main className="flex-1 w-full">
        <LandingPage
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onSelectListing={handleSelectListing}
          onBrowse={() => router.push('/listings')}
          onPostListing={() => router.push('/register?role=landlord')}
          onExploreMap={() => router.push('/listings?view=map')}
        />
      </main>

      {/* Trust Ribbon */}
      <TrustRibbon
        onMapClick={() => router.push('/listings?view=map')}
        onOwnersClick={() => router.push('/listings')}
      />

      {/* Footer */}
      <Footer onNeighborhoodClick={handleNeighborhoodClick} />
    </div>
  );
}
