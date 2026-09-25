'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Home,
  Building,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Bell,
  Pause,
  Play,
  ShieldCheck,
  MessageSquare,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import type { Listing } from '@/types/listing';
import { HeroSection } from './HeroSection';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { useSearchListingsQuery } from '@/features/listings/listingsApi';
import { CURATED_FEATURED_LISTINGS } from '../data/featuredListings';
import { TrustRibbon } from '@/components/layout/TrustRibbon';
import { MapboxView } from '@/features/map/components/MapboxView';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';

export interface LandingPageProps {
  onBrowse?: () => void;
  onPostListing?: () => void;
  onExploreMap?: () => void;
  onSelectListing?: (listing: Listing) => void;
  onToggleFavorite?: (id: string) => void;
  favoriteIds?: string[];
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBrowse,
  onPostListing,
  onExploreMap,
  onSelectListing,
  onToggleFavorite,
  favoriteIds = [],
  onOpenAuth,
}) => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [activeAudience, setActiveAudience] = useState<'renters' | 'owners'>('renters');
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch live newest listings via RTK Query
  const { data: listingsData, isLoading: isListingsLoading } = useSearchListingsQuery({
    limit: 6,
    sort: 'newest',
  });

  // Dynamic carousel items with fallback to curated high-fidelity listings
  const carouselItems: Listing[] = useMemo(() => {
    const fetched = listingsData?.results || listingsData?.data;
    if (fetched && fetched.length >= 3) {
      return fetched.slice(0, 6);
    }
    return CURATED_FEATURED_LISTINGS;
  }, [listingsData]);

  // Infinite looping list
  const infiniteCarouselItems = useMemo(() => {
    if (carouselItems.length === 0) return [];
    return [...carouselItems, ...carouselItems];
  }, [carouselItems]);

  // Auto-scrolling carousel animation
  useEffect(() => {
    const container = carouselRef.current;
    if (!container || carouselItems.length === 0) return;

    let animFrameId: number;
    const speed = 0.75; // Pixels per frame

    const step = () => {
      if (!isCarouselHovered && container) {
        container.scrollLeft += speed;
        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0 && container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      animFrameId = requestAnimationFrame(step);
    };

    animFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameId);
  }, [isCarouselHovered, carouselItems.length]);

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const handleGoBrowse = () => {
    if (onBrowse) onBrowse();
    else router.push('/listings');
  };

  const handleMapListingClick = (listing: Listing) => {
    const targetUrl = `/listings/${listing.slug || listing._id}`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else if (onSelectListing) {
      onSelectListing(listing);
    } else {
      router.push(targetUrl);
    }
  };

  const handlePost = () => {
    if (onPostListing) onPostListing();
    else if (onOpenAuth) onOpenAuth('register');
    else router.push('/register?role=landlord');
  };

  const faqs = [
    {
      q: 'What makes Kiray different from traditional street brokers (delalas)?',
      a: 'Traditional brokers charge home seekers 100% of the first month’s rent as a mandatory commission, often hide exact property addresses, and gatekeep landlord contacts. Kiray is a 100% direct peer-to-peer network where you interact directly with verified property owners with ZERO broker commissions.',
    },
    {
      q: 'Are the property locations and photos genuine?',
      a: 'Yes. Every listing on Kiray features an interactive Mapbox GPS coordinate pinpoint so you know exactly which street and neighborhood the house sits on. Photos are hosted on high-definition Cloudinary storage with verification badges for authentic owners.',
    },
    {
      q: 'How do I contact a landlord on Kiray?',
      a: 'Simply click "View Details" or use the direct 1-click WhatsApp and call buttons on any listing. You can ask questions, schedule in-person tours, or submit questions in the public Q&A section.',
    },
    {
      q: 'What precautions should I take before paying rent?',
      a: 'Rule #1: NEVER send any deposit or rent payment through mobile money before viewing the property in person and verifying property ownership documentation. Always inspect the premises and sign a formal tenancy agreement.',
    },
    {
      q: 'Is Kiray free to use for renters and owners?',
      a: 'Browsing, searching, filtering, and contacting landlords is completely free for all home seekers. Landlords can list properties, track view metrics, and manage tenant inquiries with no middleman commission.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO + 2. VALUE PROPOSITIONS BAR */}
      <div className="space-y-4 sm:space-y-6">
        <HeroSection
          featuredListing={carouselItems[0]}
          onBrowse={handleGoBrowse}
          onListProperty={handlePost}
          onExploreMap={onExploreMap || (() => router.push('/listings?view=map'))}
          onSelectListing={onSelectListing}
          isFavorite={Boolean(carouselItems[0] && favoriteIds.includes(carouselItems[0]._id))}
          onToggleFavorite={onToggleFavorite}
        />

        {/* 2. VALUE PROPOSITIONS BAR */}
        <TrustRibbon/>
      </div>

      {/* 3. HOW KIRAY WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" id="how-it-works">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900">
            How Kiray Works
          </h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            {activeAudience === 'renters'
              ? 'From search to move-in, Kiray puts you directly in contact with homeowners without expensive brokers.'
              : 'List your property in minutes, connect directly with verified renters, and manage everything with zero commissions.'}
          </p>

          {/* Audience Nav-like Switcher */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAudience('renters')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer select-none outline-none focus:outline-none border ${
                  activeAudience === 'renters'
                    ? 'bg-white text-orange-600 shadow-xs border-stone-200/70'
                    : 'text-stone-600 hover:text-slate-900 border-transparent hover:bg-stone-200/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>For Renters</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAudience('owners')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer select-none outline-none focus:outline-none border ${
                  activeAudience === 'owners'
                    ? 'bg-white text-orange-600 shadow-xs border-stone-200/70'
                    : 'text-stone-600 hover:text-slate-900 border-transparent hover:bg-stone-200/50'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>For Property Owners</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {activeAudience === 'renters' ? (
            <>
              {/* Step 1 */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  1
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Discover on Map &amp; Filters
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Explore listings across Bole, Kazanchis, CMC, and Old Airport. Filter by exact monthly budget in ETB, bedrooms, backup generator, and water tank.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  2
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Connect Directly with Owner
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  View the verified landlord profile, average response times, and real tenant reviews. Call or open a direct WhatsApp chat without middleman friction.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  3
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Tour, Sign &amp; Move In
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Visit the house at the verified Mapbox location. Inspect the amenities, negotiate directly with the owner, sign your rental agreement, and save 100% on broker fees!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Step 1 - Manage from Dashboard */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  1
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Manage from Dashboard
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Create and publish your property in minutes with photos, exact GPS location, and amenities. Easily track views, update pricing, and toggle between available or rented anytime from your dedicated landlord dashboard.
                </p>
              </div>

              {/* Step 2 - 100% Commission-Free */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  2
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  100% Commission-Free
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Keep every Birr of your rental income. Kiray never takes broker cuts or cuts into your deposits listing is completely free without middleman fees or hidden commissions.
                </p>
              </div>

              {/* Step 3 - Direct WhatsApp and phone calls */}
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xs relative space-y-4 hover:border-orange-300 transition hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  3
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Direct WhatsApp &amp; Phone Calls
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Connect instantly with vetted renters via direct phone calls and one-click WhatsApp. Schedule viewings on your own terms with zero third-party delay or broker gatekeeping.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-10">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">
              The Transparent Alternative
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Kiray vs. Traditional Street Brokers (Delala)
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
              See why renters and landlords across Addis Ababa are making the switch.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs sm:text-sm border-collapse min-w-[620px]">
              <colgroup>
                <col className="w-[30%] sm:w-[32%]" />
                <col className="w-[35%] sm:w-[34%]" />
                <col className="w-[35%] sm:w-[34%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-4 px-4 sm:px-5">Rental Feature</th>
                  <th className="py-4 px-4 sm:px-5 text-emerald-400 font-bold bg-white/5 rounded-t-xl border-b border-emerald-500/30">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kiray Direct Platform</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 sm:px-5 text-rose-400 font-bold bg-rose-500/15 rounded-t-xl border-b border-rose-500/30">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Traditional Street Delala</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                <tr>
                  <td className="py-4 px-4 sm:px-5 font-bold text-white">Broker Commission Fee</td>
                  <td className="py-4 px-4 sm:px-5 text-emerald-400 font-extrabold bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>0 ETB (100% Free)</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-5 bg-rose-950/25 text-rose-300">
                    <div className="flex items-start sm:items-center gap-2 text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                      <span>100% of 1st month rent (e.g. 25,000 ETB+)</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-5 font-bold text-white">Property Location</td>
                  <td className="py-4 px-4 sm:px-5 text-stone-200 bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Exact Mapbox GPS coordinates</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-5 bg-rose-950/25 text-rose-300">
                    <div className="flex items-start sm:items-center gap-2 text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                      <span>Vague hints ("Behind church", "Near taxi")</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-5 font-bold text-white">Landlord Access</td>
                  <td className="py-4 px-4 sm:px-5 text-stone-200 bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Direct phone &amp; 1-click WhatsApp</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-5 bg-rose-950/25 text-rose-300">
                    <div className="flex items-start sm:items-center gap-2 text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                      <span>Strictly gatekept phone numbers</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-5 font-bold text-white">Photo Quality &amp; Veracity</td>
                  <td className="py-4 px-4 sm:px-5 text-stone-200 bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Verified HD galleries with specifications</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-5 bg-rose-950/25 text-rose-300">
                    <div className="flex items-start sm:items-center gap-2 text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                      <span>Recycled, low-res WhatsApp photos</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 sm:px-5 font-bold text-white">Community Reviews &amp; Q&amp;A</td>
                  <td className="py-4 px-4 sm:px-5 text-stone-200 bg-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Real tenant reviews &amp; public questions</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-5 bg-rose-950/25 text-rose-300">
                    <div className="flex items-start sm:items-center gap-2 text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                      <span>Zero accountability or past history</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PROPERTIES PREVIEW (CAROUSEL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Handpicked Homes
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              <span className="text-xs text-stone-500 font-medium">
                {carouselItems.length} curated listings
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
              Featured Verified Listings
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Direct from owners across Addis Ababa.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">

            <button
              onClick={handleGoBrowse}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer pl-1"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={carouselRef}
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          className="flex items-stretch gap-5 overflow-x-auto scrollbar-none py-3 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {infiniteCarouselItems.map((listing, index) => (
            <div
              key={`${listing._id}-${index}`}
              className="w-[290px] sm:w-[330px] shrink-0 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <ListingCard
                listing={listing}
                isFavorite={favoriteIds.includes(listing._id)}
                onToggleFavorite={onToggleFavorite}
                onSelectListing={onSelectListing}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. DISCOVER ON THE MAP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Discover on the Map
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Top Locations in Addis Ababa
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
            Explore verified rental properties across the city directly on the live map.
          </p>
        </div>

        <div className="h-80 sm:h-[460px] w-full rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs relative">
          <MapboxView
            listings={carouselItems}
            height="h-full"
            zoom={12.5}
            onNavigateToListing={handleMapListingClick}
            showCardOverlay={false}
            usePopupPreview={true}
          />
        </div>
      </section>

      {/* 7. REAL VOICES & TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-50 border border-stone-200 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Community Trust
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Loved by Renters and Property Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                &ldquo;In the past, every time I moved in Addis I had to pay 28,000 ETB to a delala who just walked me 50 meters to a gate. With Kiray, I found a 2-bedroom in Bole Rwanda directly from the owner, visited with the Mapbox pin, and moved in with 0 commission.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                  alt="Helen Desta"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Helen Desta</div>
                  <div className="text-[11px] text-stone-500">Rented in Bole • Zero Broker Fees</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                &ldquo;I own two furnished apartments in Kazanchis. Delalas used to bring unqualified tenants who negotiated aggressively and disappeared. On Kiray, tenants see exact photos, ask questions upfront, and I leased to an NGO professional in 3 days.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                  alt="Dawit Bekele"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Dawit Bekele</div>
                  <div className="text-[11px] text-stone-500">Property Owner • Kazanchis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="safety-tips">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Clear Answers &amp; Safety
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-stone-50 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-orange-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-orange-600 to-orange-700 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Ready to find your next home?
            </h2>
            <p className="text-xs sm:text-base text-orange-100 leading-relaxed">
              Join thousands of renters and landlords who connect directly on Kiray with zero broker fees.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGoBrowse}
              className="px-6 py-3.5 bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Browse Addis Properties
            </button>
            <button
              onClick={handlePost}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Create Free Account
            </button>
          </div>

          <div className="text-[11px] text-orange-200 font-medium">
            Your journey to a new home, made simple. • Kiray Addis Ababa
          </div>
        </div>
      </section>
    </div>
  );
};
